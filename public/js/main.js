var btn_slide = 1; // Button slide either correct or suggest
var correct_btn = document.querySelector('#corr_btn'); // Correct button
var suggest_btn = document.querySelector('#sugg_btn'); // Suggest button
var slid1 = document.querySelector('#slid1'); // Slid1 button
var slid2 = document.querySelector('#slid2'); // Slid2 button
var pad_txt1 = document.querySelector('#pad_txt1'); // Pad txt 1 
var pad_txt2 = document.querySelector('#pad_txt2'); // Pad txt 2
var correct_index = document.querySelector('#correct_index'); // Correct index
var suggest_index = document.querySelector('#suggest_index'); // Suggest index
var clickable_panel = document.querySelector('#clickable_panel'); // Clickable panel
var text_data_input = document.querySelector('#text_data'); // Text data input
var text_data_output = document.querySelector('#text_data_output'); // Text data output
var char_count = document.querySelector('#char_count'); // Char count
var word_count = document.querySelector('#word_count'); // Word count
var trash_btn = document.querySelector('#trash_btn'); // Trash btn
var copy_btn = document.querySelector('#copy_btn'); // Copy btn
var error_indicator = document.querySelector('#error_indicator'); // Error indicator
var load_text = document.querySelector('#load_text'); // Load text
var can_make_request = true; // Can make request
var correct_index_error = document.querySelector('#correct_index_error'); // Correct index error
var correct_index_intro = document.querySelector('#correct_index_intro'); // Correct index intro
var suggest_index_error = document.querySelector('#suggest_index_error'); // Suggest index error
var suggest_index_intro = document.querySelector('#suggest_index_intro'); // Suggest index intro
var correct_index_loader = document.querySelector('#correct_index_loader'); // Correct index loader
var suggest_index_loader = document.querySelector('#suggest_index_loader'); // Suggest index loader
var correct_index_no_error = document.querySelector('#correct_index_no_error'); // Correct index no error
var suggest_index_no_error = document.querySelector('#suggest_index_no_error'); // Suggest index no error
var correct_index_result = document.querySelector('#correct_index_result'); // Correct index result
var suggest_index_result = document.querySelector('#suggest_index_result'); // Suggest index result
var suggest_index_no_suggestions = document.querySelector('#suggest_index_no_suggestions'); // Suggest index no suggestions
var user_input = document.querySelector('#user_input'); // User input
var user_output = document.querySelector('#user_output'); // User output
var text_errors = []; // Text errors
var typingTimer; // Timer identifier
var doneTypingInterval = 1000; // Time in ms, 5 seconds for example

// Detect when the user types into the text data input field
text_data_input.addEventListener('keyup', () => {
    var text_length = text_data_input.value.length;
    char_count.innerHTML = text_length;
    var text_count = text_data_input.value.split(" ");
    word_count.innerHTML = text_count.length;
    var text_data = text_data_input.value;

    clearTimeout(typingTimer); // Clear timer

    // Start timer
    typingTimer = setTimeout(() => {
        doneTyping(text_data, text_length, text_count, word_count)
    }, doneTypingInterval);
    //---------------------------------
});
//---------------------------------------------------

// Detect if the user has stopped typing into the input filed
text_data_input.addEventListener('keydown', () => {
    clearTimeout(typingTimer);
});
//------------------------------------

// Detect when the user is done
async function doneTyping (text_data, text_length, text_count, word_count) {
    if (text_length > 3){
        if (/^ *$/.test(text_data)){
            // Do nothing
        } else {
            let sanitize_data = text_data.split('"').join('').replace(/^[ ]+|[ ]+$/g, '').trim(); // Return sanitized data

            if (sanitize_data.length > 3){
                if (can_make_request === true){
                    can_make_request = false;
                    load_text.style.display = 'inline-block';
                    correct_index_loader.style.display = 'block';
                    suggest_index_loader.style.display = 'block';
                    correct_index_intro.style.display = 'none';
                    correct_index_error.style.display = 'none';
                    suggest_index_intro.style.display = 'none';
                    suggest_index_error.style.display = 'none';
                    correct_index_no_error.style.display = 'none';
                    suggest_index_no_error.style.display = 'none';
                    correct_index_result.style.display = 'none';
                    suggest_index_result.style.display = 'none';
                    suggest_index_no_suggestions.style.display = 'none';

                    if (btn_slide === 1){
                        correct_index.style.display = 'block';
                        suggest_index.style.display = 'none';
                    } else if (btn_slide === 2){
                        correct_index.style.display = 'none';
                        suggest_index.style.display = 'block';
                    }
                    
                    let result_data = await api_request(text_data); // Make request to API
    
                    if (result_data.status === true){
                        can_make_request = true;
                        
                        if (result_data.errors.length > 0){
                            text_data_input.value = result_data.autocorrected_text;
                            text_errors = result_data.errors;
                            let array_of_err_words = [];
                            correct_index_result.innerHTML = '';
                            suggest_index_result.innerHTML = '';
                            let no_suggestions = 0;
                            let better_array = [];

                            for (let [i, error] of text_errors.entries()){
                                array_of_err_words.push(error.bad);
                                let err_type = error.type;
                                let divElement = document.createElement("div"); // Create a new div element
                                divElement.setAttribute("id", "list_ribbon");
                                divElement.innerHTML = `
                                    <span id="mark_dot"></span>
                                    <span id="possible_err">
                                        <span id="err_word">${error.bad}</span>&nbsp;&nbsp;<span id="tiny_dash">--</span>&nbsp;&nbsp;<span id="err_type">${err_type.charAt(0).toUpperCase() + err_type.slice(1)} error</span>
                                    </span>
                                `;
                                correct_index_result.appendChild(divElement);

                                let ava_words = '';
                                let words = error.better;

                                for (let [i, suggestion] of words.entries()){
                                    if (words.length > 1){
                                        let length_val = words.length;
                                        let sub_val = length_val - 1;

                                        if (sub_val === i){
                                            ava_words = ava_words + suggestion;
                                        } else {
                                            ava_words = ava_words + suggestion + ', ';
                                        }
                                    } else if (words.length === 1){
                                        ava_words = suggestion;
                                    } else {
                                        ava_words = '';
                                    }
                                }

                                if (words.length > 0){
                                    if (words[0] !== ''){
                                        better_array.push(words);
                                    }
                                
                                    no_suggestions ++;
                                    let suggdivElement = document.createElement("div"); // Create a new div element
                                    suggdivElement.setAttribute("id", "list_ribbon_x");
                                    let conv_str = ava_words.replace(/['"]/g, '\\$&');

                                    if (ava_words !== ""){
                                        suggdivElement.innerHTML = `
                                            <div id="ribbon_head">
                                                <div id="label_pad">
                                                    <span id="ribbon_icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" fill="none">
                                                            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                                                            <g id="SVGRepo_iconCarrier"> <circle cx="12" cy="17" r="1" fill="#1976f0"/> <path d="M12 10L12 14" stroke="#1976f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M3.44722 18.1056L10.2111 4.57771C10.9482 3.10361 13.0518 3.10362 13.7889 4.57771L20.5528 18.1056C21.2177 19.4354 20.2507 21 18.7639 21H5.23607C3.7493 21 2.78231 19.4354 3.44722 18.1056Z" stroke="#1976f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>    
                                                        </svg>
                                                    </span>

                                                    <span id="ribbon_err_word">${error.bad}</span>
                                                </div>
                                            </div>

                                            <div id="ribbon_text">
                                                <p id="vbc">${(error.better.length > 1) ? `They are ${error.better.length} suggestions found for this text:` : (error.better.length === 1) ? `There is only 1 suggestion found for this text:` : `No suggestion was found for this text.`}</p>
                                                <p id="bbx" onclick="copy_words('${conv_str}')">${ava_words}</p>
                                            </div>
                                        `;
                                        suggest_index_result.appendChild(suggdivElement);
                                    }
                                }
                            }

                            if (no_suggestions === 0 && text_errors.length > 0){
                                suggest_index_no_suggestions.style.display = 'block';
                            } else if (better_array.length === 0){
                                suggest_index_no_suggestions.style.display = 'block';
                            } else {
                                suggest_index_result.style.display = 'block';
                            }
                            
                            let underlinedSentence = underlineWords(text_data, array_of_err_words);
                            user_output.innerText = result_data.autocorrected_text;
                            user_input.innerHTML = underlinedSentence;
                            text_data_input.style.display = 'none';
                            text_data_output.style.display = 'block';
                            load_text.style.display = 'none';
                            error_indicator.innerHTML = (text_errors.length > 9) ? '9+' : text_errors.length;
                            error_indicator.style.background = '#ef2850';
                            error_indicator.style.border = '1px #ef2850 solid';
                            error_indicator.style.color = '#FFFFFF';
                            correct_index_intro.style.display = 'none';
                            correct_index_error.style.display = 'none';
                            suggest_index_intro.style.display = 'none';
                            suggest_index_error.style.display = 'none';
                            correct_index_loader.style.display = 'none';
                            suggest_index_loader.style.display = 'none';
                            correct_index_no_error.style.display = 'none';
                            suggest_index_no_error.style.display = 'none';
                            correct_index_result.style.display = 'block';

                            if (btn_slide === 1){
                                correct_index.style.display = 'block';
                                suggest_index.style.display = 'none';
                            } else if (btn_slide === 2){
                                correct_index.style.display = 'none';
                                suggest_index.style.display = 'block';
                            }
                        } else {
                            text_data_input.value = result_data.autocorrected_text;
                            load_text.style.display = 'none';
                            error_indicator.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="16px" height="16px" viewBox="0 0 32 32" stroke="#FFFFFF">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                    <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z"></path>
                                    </g>    
                                </svg>
                            `;
                            error_indicator.style.background = '#239aff';
                            error_indicator.style.border = '1px #239aff solid';
                            correct_index_intro.style.display = 'none';
                            correct_index_error.style.display = 'none';
                            suggest_index_intro.style.display = 'none';
                            suggest_index_error.style.display = 'none';
                            correct_index_loader.style.display = 'none';
                            suggest_index_loader.style.display = 'none';
                            correct_index_no_error.style.display = 'block';
                            suggest_index_no_error.style.display = 'block';
                            correct_index_result.style.display = 'none';
                            suggest_index_result.style.display = 'none';
                            suggest_index_no_suggestions.style.display = 'none';

                            if (btn_slide === 1){
                                correct_index.style.display = 'block';
                                suggest_index.style.display = 'none';
                            } else if (btn_slide === 2){
                                correct_index.style.display = 'none';
                                suggest_index.style.display = 'block';
                            }
                        }
                    } else if (result_data.status === 'error_occured'){
                        load_text.style.display = 'none';
                        error_indicator.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="16px" height="16px" viewBox="0 0 32 32" stroke="#FFFFFF">
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z"></path>
                                </g>    
                            </svg>
                        `;
                        error_indicator.style.background = '#239aff';
                        error_indicator.style.border = '1px #239aff solid';
                        correct_index_intro.style.display = 'none';
                        correct_index_error.style.display = 'block';
                        suggest_index_intro.style.display = 'none';
                        suggest_index_error.style.display = 'block';
                        correct_index_loader.style.display = 'none';
                        suggest_index_loader.style.display = 'none';
                        correct_index_no_error.style.display = 'none';
                        suggest_index_no_error.style.display = 'none';
                        correct_index_result.style.display = 'none';
                        suggest_index_result.style.display = 'none';
                        suggest_index_no_suggestions.style.display = 'none';

                        user_output.innerText = '';
                        user_input.innerHTML = '';
                        text_data_input.style.display = 'block';
                        text_data_output.style.display = 'none';

                        if (btn_slide === 1){
                            correct_index.style.display = 'block';
                            suggest_index.style.display = 'none';
                        } else if (btn_slide === 2){
                            correct_index.style.display = 'none';
                            suggest_index.style.display = 'block';
                        }

                        can_make_request = true;
                    }
                }
            }
        }
    } else if (text_count.length == 1){
        if (text_count[0] == ''){
            word_count.innerHTML = 0;
        } else {
            word_count.innerHTML = 1;
        }
    } else {
        word_count.innerHTML = 0;
        load_text.style.display = 'none';
        error_indicator.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="16px" height="16px" viewBox="0 0 32 32" stroke="#FFFFFF">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z"></path>
                </g>    
            </svg>
        `;
        error_indicator.style.background = '#239aff';
        error_indicator.style.border = '1px #239aff solid';
        correct_index_intro.style.display = 'none';
        correct_index_error.style.display = 'block';
        suggest_index_intro.style.display = 'none';
        suggest_index_error.style.display = 'block';
        correct_index_loader.style.display = 'none';
        suggest_index_loader.style.display = 'none';
        correct_index_no_error.style.display = 'none';
        suggest_index_no_error.style.display = 'none';
        correct_index_result.style.display = 'none';
        suggest_index_result.style.display = 'none';
        suggest_index_no_suggestions.style.display = 'none';

        user_output.innerText = '';
        user_input.innerHTML = '';
        text_data_input.style.display = 'block';
        text_data_output.style.display = 'none';

        if (btn_slide === 1){
            correct_index.style.display = 'block';
            suggest_index.style.display = 'none';
        } else if (btn_slide === 2){
            correct_index.style.display = 'none';
            suggest_index.style.display = 'block';
        }
    }
}
//-----------------------------------------------------

// Detect when a user clicks on the correct button tab
correct_btn.addEventListener('click', () => {
    if (btn_slide === 1){
        correct_index.style.display = 'block';
        suggest_index.style.display = 'none';
    } else if (btn_slide === 2){
        btn_slide = 1;
        suggest_btn.classList.remove('active_seg_btn');
        slid2.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier"> <path d="M7.83331 13.6C8.258 14.4031 8.97942 15.0676 9.88885 15.4934C10.7983 15.9191 11.8465 16.083 12.8755 15.9604C13.9045 15.8378 14.8586 15.4353 15.594 14.8136L17 13.7451M17 16V13.6H14.5M16.1667 10.4C15.742 9.59687 15.0206 8.93238 14.1111 8.50664C13.2017 8.08091 12.1535 7.91699 11.1245 8.03959C10.0955 8.16219 9.1414 8.56467 8.40599 9.18637L7 10.2549M7 8V10.4H9.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#239aff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
            </svg>
        `;
        pad_txt2.style.color = '#239aff';
        correct_btn.classList.add('active_seg_btn');
        slid1.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M7 10.32C7 7.58598 7.58598 7 10.32 7H13.68C16.414 7 17 7.58598 17 10.32V13.68C17 16.414 16.414 17 13.68 17H10.32C7.58598 17 7 16.414 7 13.68V10.32Z" fill="#FFFFFF"/> <path d="M21 3L3 3" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M21 21L3 21" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M7 10.32C7 7.58598 7.58598 7 10.32 7H13.68C16.414 7 17 7.58598 17 10.32V13.68C17 16.414 16.414 17 13.68 17H10.32C7.58598 17 7 16.414 7 13.68V10.32Z" stroke="#FFFFFF" stroke-width="2"/> </g>
            </svg>
        `;
        pad_txt1.style.color = '#FFF';

        $("#suggest_index").fadeOut(200);

        setTimeout(() => {
            $("#correct_index").fadeIn(200);
        }, 300);

        setTimeout(() => {
            suggest_index.style.display = 'none';
        }, 100);
    }
});
//----------------------------------------------------

// Detect when a user clicks on the suggest button tab
suggest_btn.addEventListener('click', () => {
    if (btn_slide === 1){
        btn_slide = 2;
        correct_btn.classList.remove('active_seg_btn');
        slid1.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M7 10.32C7 7.58598 7.58598 7 10.32 7H13.68C16.414 7 17 7.58598 17 10.32V13.68C17 16.414 16.414 17 13.68 17H10.32C7.58598 17 7 16.414 7 13.68V10.32Z" fill="#239aff"/> <path d="M21 3L3 3" stroke="#239aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M21 21L3 21" stroke="#239aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M7 10.32C7 7.58598 7.58598 7 10.32 7H13.68C16.414 7 17 7.58598 17 10.32V13.68C17 16.414 16.414 17 13.68 17H10.32C7.58598 17 7 16.414 7 13.68V10.32Z" stroke="#239aff" stroke-width="2"/> </g>
            </svg>
        `;
        pad_txt1.style.color = '#239aff';
        suggest_btn.classList.add('active_seg_btn');
        slid2.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier"> <path d="M7.83331 13.6C8.258 14.4031 8.97942 15.0676 9.88885 15.4934C10.7983 15.9191 11.8465 16.083 12.8755 15.9604C13.9045 15.8378 14.8586 15.4353 15.594 14.8136L17 13.7451M17 16V13.6H14.5M16.1667 10.4C15.742 9.59687 15.0206 8.93238 14.1111 8.50664C13.2017 8.08091 12.1535 7.91699 11.1245 8.03959C10.0955 8.16219 9.1414 8.56467 8.40599 9.18637L7 10.2549M7 8V10.4H9.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
            </svg>
        `;
        pad_txt2.style.color = '#FFF';

        $("#correct_index").fadeOut(200);
        
        setTimeout(() => {
            $("#suggest_index").fadeIn(200);
        }, 300);

        setTimeout(() => {
            correct_index.style.display = 'none';
        }, 100);
    } else if (btn_slide === 2){
        correct_index.style.display = 'none';
        suggest_index.style.display = 'block';
    }
});
//-------------------------------------------------------

// Open up about modal when user clicks on the info icon
document.querySelector('#about_icon').addEventListener('click', () => {
    $('.ui.modal')
        .modal('show')
    ;
});
//---------------------------------------------

// Insert text into text area by clicking on the clickable panel button
clickable_panel.addEventListener('click', async () => {
    if (can_make_request === true){
        can_make_request = false;
        text_data_input.value = '';
        text_data_input.value = `AutocorrectTool is your intelligent writing assistant for all common browsers. Write or paste your text here too have it checked continuously. Errors will be shaded in red colour. Furthermore autocorrected text will be highlighted in yellow. did you know that you can gett suggestionss by typing words into the text area field? Its a impressively versatile tool especially if youd like to tell a colleague from over sea's about what happened at 5 PM in the afternoon on Monday, 27 May 2007.`;
        var text_length = text_data_input.value.length;
        var text_count = text_data_input.value.split(" ");
        char_count.innerHTML = text_length;
        word_count.innerHTML = text_count.length;
        var text_data = text_data_input.value;

        let no_suggestions = 0;

        load_text.style.display = 'inline-block';
        correct_index_loader.style.display = 'block';
        suggest_index_loader.style.display = 'block';
        correct_index_intro.style.display = 'none';
        correct_index_error.style.display = 'none';
        suggest_index_intro.style.display = 'none';
        suggest_index_error.style.display = 'none';
        correct_index_no_error.style.display = 'none';
        suggest_index_no_error.style.display = 'none';
        correct_index_result.style.display = 'none';
        suggest_index_result.style.display = 'none';

        if (btn_slide === 1){
            correct_index.style.display = 'block';
            suggest_index.style.display = 'none';
        } else if (btn_slide === 2){
            correct_index.style.display = 'none';
            suggest_index.style.display = 'block';
        }
        
        let result_data = await api_request(text_data); // Make request to API

        if (result_data.status === true){
            can_make_request = true;
            
            if (result_data.errors.length > 0){
                text_data_input.value = result_data.autocorrected_text;
                text_errors = result_data.errors;
                let array_of_err_words = [];
                correct_index_result.innerHTML = '';
                suggest_index_result.innerHTML = '';
                let better_array = [];

                for (let [i, error] of text_errors.entries()){
                    array_of_err_words.push(error.bad);
                    let err_type = error.type;
                    let divElement = document.createElement("div"); // Create a new div element
                    divElement.setAttribute("id", "list_ribbon");
                    divElement.innerHTML = `
                        <span id="mark_dot"></span>
                        <span id="possible_err">
                            <span id="err_word">${error.bad}</span>&nbsp;&nbsp;<span id="tiny_dash">--</span>&nbsp;&nbsp;<span id="err_type">${err_type.charAt(0).toUpperCase() + err_type.slice(1)} error</span>
                        </span>
                    `;
                    correct_index_result.appendChild(divElement);

                    let ava_words = '';
                    let words = error.better;

                    for (let [i, suggestion] of words.entries()){
                        if (words.length > 1){
                            let length_val = words.length;
                            let sub_val = length_val - 1;

                            if (sub_val === i){
                                ava_words = ava_words + suggestion;
                            } else {
                                ava_words = ava_words + suggestion + ', ';
                            }
                        } else if (words.length === 1){
                            ava_words = suggestion;
                        } else {
                            ava_words = '';
                        }
                    }

                    if (words.length > 0){
                        if (words[0] !== ''){
                            better_array.push(words);
                        }

                        no_suggestions ++;
                        let suggdivElement = document.createElement("div"); // Create a new div element
                        suggdivElement.setAttribute("id", "list_ribbon_x");
                        let conv_str = ava_words.replace(/['"]/g, '\\$&')

                        if (ava_words !== ""){
                            suggdivElement.innerHTML = `
                                <div id="ribbon_head">
                                    <div id="label_pad">
                                        <span id="ribbon_icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" fill="none">
                                                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                                                <g id="SVGRepo_iconCarrier"> <circle cx="12" cy="17" r="1" fill="#1976f0"/> <path d="M12 10L12 14" stroke="#1976f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M3.44722 18.1056L10.2111 4.57771C10.9482 3.10361 13.0518 3.10362 13.7889 4.57771L20.5528 18.1056C21.2177 19.4354 20.2507 21 18.7639 21H5.23607C3.7493 21 2.78231 19.4354 3.44722 18.1056Z" stroke="#1976f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>    
                                            </svg>
                                        </span>

                                        <span id="ribbon_err_word">${error.bad}</span>
                                    </div>
                                </div>

                                <div id="ribbon_text">
                                    <p id="vbc">${(error.better.length > 1) ? `They are ${error.better.length} suggestions found for this text:` : (error.better.length === 1) ? `There is only 1 suggestion found for this text:` : `No suggestion was found for this text.`}</p>
                                    <p id="bbx" onclick="copy_words('${conv_str}')">${ava_words}</p>
                                </div>
                            `;
                            suggest_index_result.appendChild(suggdivElement);
                        }
                    }
                }

                if (no_suggestions === 0 && text_errors.length > 0){
                    suggest_index_no_suggestions.style.display = 'block';
                } else if (better_array.length === 0){
                    suggest_index_no_suggestions.style.display = 'block';
                } else {
                    suggest_index_result.style.display = 'block';
                }

                let underlinedSentence = underlineWords(text_data, array_of_err_words);
                user_output.innerText = result_data.autocorrected_text;
                user_input.innerHTML = underlinedSentence;
                text_data_input.style.display = 'none';
                text_data_output.style.display = 'block';
                load_text.style.display = 'none';
                error_indicator.innerHTML = (text_errors.length > 9) ? '9+' : text_errors.length;
                error_indicator.style.background = '#ef2850';
                error_indicator.style.border = '1px #ef2850 solid';
                error_indicator.style.color = '#FFFFFF';
                correct_index_intro.style.display = 'none';
                correct_index_error.style.display = 'none';
                suggest_index_intro.style.display = 'none';
                suggest_index_error.style.display = 'none';
                correct_index_loader.style.display = 'none';
                suggest_index_loader.style.display = 'none';
                correct_index_no_error.style.display = 'none';
                suggest_index_no_error.style.display = 'none';
                correct_index_result.style.display = 'block';

                if (btn_slide === 1){
                    correct_index.style.display = 'block';
                    suggest_index.style.display = 'none';
                } else if (btn_slide === 2){
                    correct_index.style.display = 'none';
                    suggest_index.style.display = 'block';
                }
            } else {
                text_data_input.value = result_data.autocorrected_text;
                load_text.style.display = 'none';
                error_indicator.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="16px" height="16px" viewBox="0 0 32 32" stroke="#FFFFFF">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                        <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z"></path>
                        </g>    
                    </svg>
                `;
                error_indicator.style.background = '#239aff';
                error_indicator.style.border = '1px #239aff solid';
                correct_index_intro.style.display = 'none';
                correct_index_error.style.display = 'none';
                suggest_index_intro.style.display = 'none';
                suggest_index_error.style.display = 'none';
                correct_index_loader.style.display = 'none';
                suggest_index_loader.style.display = 'none';
                correct_index_no_error.style.display = 'block';
                suggest_index_no_error.style.display = 'block';
                correct_index_result.style.display = 'none';
                suggest_index_result.style.display = 'none';
                suggest_index_no_suggestions.style.display = 'none';

                if (btn_slide === 1){
                    correct_index.style.display = 'block';
                    suggest_index.style.display = 'none';
                } else if (btn_slide === 2){
                    correct_index.style.display = 'none';
                    suggest_index.style.display = 'block';
                }
            }
        } else if (result_data.status === 'error_occured'){
            load_text.style.display = 'none';
            error_indicator.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="16px" height="16px" viewBox="0 0 32 32" stroke="#FFFFFF">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                    <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z"></path>
                    </g>    
                </svg>
            `;
            error_indicator.style.background = '#239aff';
            error_indicator.style.border = '1px #239aff solid';
            correct_index_intro.style.display = 'none';
            correct_index_error.style.display = 'block';
            suggest_index_intro.style.display = 'none';
            suggest_index_error.style.display = 'block';
            correct_index_loader.style.display = 'none';
            suggest_index_loader.style.display = 'none';
            correct_index_no_error.style.display = 'none';
            suggest_index_no_error.style.display = 'none';
            correct_index_result.style.display = 'none';
            suggest_index_result.style.display = 'none';
            suggest_index_no_suggestions.style.display = 'none';

            user_output.innerText = '';
            user_input.innerHTML = '';
            text_data_input.style.display = 'block';
            text_data_output.style.display = 'none';

            if (btn_slide === 1){
                correct_index.style.display = 'block';
                suggest_index.style.display = 'none';
            } else if (btn_slide === 2){
                correct_index.style.display = 'none';
                suggest_index.style.display = 'block';
            }

            can_make_request = true;
        }
    }    
});
//--------------------------------------------------------------

// Clear text area by clicking on trash btn
trash_btn.addEventListener('click', () => {
    if (can_make_request === true){
        text_data_input.value = '';
        char_count.innerHTML = 0;
        word_count.innerHTML = 0;

        load_text.style.display = 'none';
        error_indicator.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="16px" height="16px" viewBox="0 0 32 32" stroke="#FFFFFF">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z"></path>
                </g>    
            </svg>
        `;

        error_indicator.style.background = '#239aff';
        error_indicator.style.border = '1px #239aff solid';
        correct_index_intro.style.display = 'block';
        correct_index_error.style.display = 'none';
        suggest_index_intro.style.display = 'block';
        suggest_index_error.style.display = 'none';
        correct_index_loader.style.display = 'none';
        suggest_index_loader.style.display = 'none';
        correct_index_no_error.style.display = 'none';
        suggest_index_no_error.style.display = 'none';
        suggest_index_no_suggestions.style.display = 'none';

        correct_index_result.style.display = 'none';
        suggest_index_result.style.display = 'none';

        user_output.innerText = '';
        user_input.innerHTML = '';
        text_data_input.style.display = 'block';
        text_data_output.style.display = 'none';

        can_make_request = true;

        if (btn_slide === 1){
            correct_index.style.display = 'block';
            suggest_index.style.display = 'none';
        } else if (btn_slide === 2){
            correct_index.style.display = 'none';
            suggest_index.style.display = 'block';
        }
    }
});
//--------------------------------------------------

// Copy data to clipboard
copy_btn.addEventListener('click', () => {
  var copyText = text_data_input; // Copy text from textarea input field
  
  // Select the entire text
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  //--------------------------------------

  navigator.clipboard.writeText(copyText.value); // Paste text to the native clipboard
  
  alert("Text copied!"); // Alert user that the text was copied successfully
});
//---------------------

// Copy data to clipboard
let copy_words = (text) => {
    navigator.clipboard.writeText(text); // Paste text to the native clipboard
    
    alert("Text copied!"); // Alert user that the text was copied successfully
};
//------------------------------------------

let api_request = async (text_data) => {
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/api/autocorrect", {
            method: "POST", // Adding method type
            
            // Adding body or contents to send
            body: JSON.stringify({
                text_data: text_data
            }),
            //----------------------------------
            
            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
            //----------------------------------
        })

        .then(response => response.json()) // Converting to JSON
    
        // Render and use JSON
        .then(response => {
            can_make_request = true;
            resolve(response);
        })
        //------------------------

        .catch(err => {
            can_make_request = true;
            resolve({ status: 'error_occured' });
        })
    });
};

// Underline words in a sentence
let underlineWords = (sentence, words) => {

    // Loop through the array of words and replace them with the underlined version
    for (let i = 0; i < words.length; i++) {
      sentence = sentence.replace(words[i], `<span id="wrap_txt">` + words[i] + `</span>`);
    }
    //----------------------------------------

    return sentence; // Return the sentence with the underlined words
}
//--------------------------------------------