require('dotenv').config(); // Import and configure dotenv module
var Typo = require("typo-js"); // Import typo module
var dictionary = new Typo('en_US'); // Import dictionary module
let textgears = require('textgears-api'); // Import textgears module
var sanitize_data = require('../utility/sanitize_data.util'); // Import sanitize data
var axios = require('axios'); // Import axios

const autocorrect = async (req, res) => {

    // Appropriate response headers
    res.setHeader('Access-Control-Allow-Origin', process.env.URL);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //----------------------------------------------

    // Validate the request form body data
    if (req.body){
        let form_data = req.body; // Form data from the frontend

        // Check if the appropriate request parameters are set
        if (form_data.text_data){
            if (typeof form_data.text_data === 'string' || form_data.text_data instanceof string){
                var text = sanitize_data(form_data.text_data); // Text data from frontend

                if (text.length > 0){
                    let array_of_words = text.split(" "); // Split text data int
                    let new_text = ""; // New autocorrected text
    
                    const textgearsApi = textgears(process.env.TEXT_GEARS_API_TOKEN, {language: 'en-US', ai: true}); // Instantiate textgears api function
                    textgearsApi.suggest(text) // Use textgears api to autocorrect text data and provide suggestions
                        .then((data) => {
                            // Check if text data was autocorrected
                            if (data.response.corrected){

                                // Check if text data has grammatical errors
                                textgearsApi.checkGrammar(text)
                                    .then((result) => {
                                        let possible_errors = result.response.errors; // All errors
                                        let correct_data = data.response.corrected; // Autocorrected text
                                        let array_of_corrected_data = correct_data.split(" "); // Split autocorrected text into words and store them in an array

                                        // Check if errors are present
                                        if (possible_errors.length > 0){
                                            let loop_func = async () => {
                                                // Loop through all the errors
                                                for (let [x, error] of possible_errors.entries()) {
                                                    let bad_word = error.bad; // The bad word from the text data
                                                    let better_words = error.better; // An array of word based suggestions
                                                    
                                                    // Make a request to urban dictionary api to find out if the bad word above is a slang
                                                    let urban_dic = async () => {
                                                        return new Promise((resolve, reject) => {
                                                        axios.get(`https://api.urbandictionary.com/v0/define?term=${bad_word}`)
                                                            .then(res => {
                                                                let response = res.data;
                                                                if (response.list.length > 0) {
                                                                    resolve({ status: true });
                                                                } else {
                                                                    resolve({ status: false });
                                                                }
                                                            })

                                                            .catch(err => {
                                                                resolve({ status: 'error_occured' });
                                                            })
                                                        });
                                                    }
                                                    //-----------------------------------------------------------
                                                    
                                                    // Replace autocorrected words in autocorrected text with appropriate slangs if any
                                                    let second_part = async () => {
                                                        let run_func = await urban_dic();
                                                        if (run_func.status === true) {
                                                            for (let [i, word] of array_of_corrected_data.entries()) {
                                                                if (better_words.includes(word)) {
                                                                    array_of_corrected_data[i] = bad_word;
                                                                    possible_errors.splice(x, 1);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    //--------------------------------------------------------
                                                
                                                    await second_part(); // Call the second part function above
                                                }
                                                //-------------------------------------------
                                              
                                                let real_autocorrected_text = ''; // Final autocorrected text
                                              
                                                for (let [i, word] of array_of_corrected_data.entries()) {
                                                    let num = array_of_corrected_data.length - 1;
                                                    if (num === i) {
                                                        real_autocorrected_text = real_autocorrected_text + word;
                                                    } else {
                                                        real_autocorrected_text = real_autocorrected_text + word + " ";
                                                    }
                                                }
                                              
                                                res.statusCode = 200;
                                                res.json({ status: true, msg: 'Text autocorrected successfully!', errors: possible_errors, autocorrected_text: real_autocorrected_text });
                                              }
                                              
                                              loop_func(); // Execute loop func above
                                        } else {
                                            res.statusCode = 200;
                                            res.json({ status: true, msg: 'Text autocorrected successfully!', errors: [], autocorrected_text: data.response.corrected });
                                        }
                                        //----------------------------------------------
                                    })
                                    .catch(err => {

                                        // Incase of an error when trying to use textgears api, switch to normal text analysis mode
                                        let array_of_errors = [];

                                        for (let [i, word] of array_of_words.entries()){
                                            let word_check = dictionary.check(word);
                        
                                            if (word_check === true){
                                                let num = array_of_words.length - 1;
                        
                                                if (num === i){
                                                    new_text = new_text + word;
                                                } else {
                                                    new_text = new_text + word + " ";
                                                }
                                            } else {
                                                let array_of_suggestions = dictionary.suggest(word);
                                                let bad_word = word;
                                                let error_type = 'spelling';

                                                if (array_of_suggestions.length > 0){
                                                    let autocorrect = require('autocorrect')({words: array_of_suggestions});
                                                    let correct_word = autocorrect(word);
                            
                                                    let num = array_of_words.length - 1;
                            
                                                    if (num === i){
                                                        new_text = new_text + correct_word;
                                                    } else {
                                                        new_text = new_text + correct_word + " ";
                                                    }
                                                }

                                                let obj = {
                                                    bad: bad_word,
                                                    better: array_of_suggestions,
                                                    type: error_type
                                                }

                                                array_of_errors.push(obj);
                                            }
                                        }

                                        if (array_of_errors.length > 0){
                                            if (typeof new_text === 'string' || new_text instanceof string){
                                                res.statusCode = 200;
                                                res.json({ status: true, msg: 'Text autocorrected successfully!', errors: array_of_errors, autocorrected_text: new_text });
                                            } else {
                                                res.statusCode = 200;
                                                res.json({ status: true, msg: 'Text autocorrected successfully!', errors: array_of_errors, autocorrected_text: text });
                                            }
                                        } else {
                                            res.statusCode = 200;
                                            res.json({ status: true, msg: 'Text autocorrected successfully!', errors: [], autocorrected_text: new_text });
                                        }
                                        //------------------------------------------------------------------------
                                    })
                            } else {

                                // Incase of an error when trying to use textgears api, switch to normal text analysis mode
                                let array_of_errors = [];

                                for (let [i, word] of array_of_words.entries()){
                                    let word_check = dictionary.check(word);
                
                                    if (word_check === true){
                                        let num = array_of_words.length - 1;
                
                                        if (num === i){
                                            new_text = new_text + word;
                                        } else {
                                            new_text = new_text + word + " ";
                                        }
                                    } else {
                                        let array_of_suggestions = dictionary.suggest(word);
                                        let bad_word = word;
                                        let error_type = 'spelling';

                                        if (array_of_suggestions.length > 0){
                                            let autocorrect = require('autocorrect')({words: array_of_suggestions});
                                            let correct_word = autocorrect(word);
                    
                                            let num = array_of_words.length - 1;
                    
                                            if (num === i){
                                                new_text = new_text + correct_word;
                                            } else {
                                                new_text = new_text + correct_word + " ";
                                            }
                                        }

                                        let obj = {
                                            bad: bad_word,
                                            better: array_of_suggestions,
                                            type: error_type
                                        }

                                        array_of_errors.push(obj);
                                    }
                                }

                                if (array_of_errors.length > 0){
                                    if (typeof new_text === 'string' || new_text instanceof string){
                                        res.statusCode = 200;
                                        res.json({ status: true, msg: 'Text autocorrected successfully!', errors: array_of_errors, autocorrected_text: new_text });
                                    } else {
                                        res.statusCode = 200;
                                        res.json({ status: true, msg: 'Text autocorrected successfully!', errors: array_of_errors, autocorrected_text: text });
                                    }
                                } else {
                                    res.statusCode = 200;
                                    res.json({ status: true, msg: 'Text autocorrected successfully!', errors: [], autocorrected_text: new_text });
                                }
                                //---------------------------------------------------------------------
                            }
                            //---------------------------------------------------------------------
                        })
                        .catch((err) => {

                            // Incase of an error when trying to use textgears api, switch to normal text analysis mode
                            let array_of_errors = [];

                            for (let [i, word] of array_of_words.entries()){
                                let word_check = dictionary.check(word);
            
                                if (word_check === true){
                                    let num = array_of_words.length - 1;
            
                                    if (num === i){
                                        new_text = new_text + word;
                                    } else {
                                        new_text = new_text + word + " ";
                                    }
                                } else {
                                    let array_of_suggestions = dictionary.suggest(word);
                                    let bad_word = word;
                                    let error_type = 'spelling';

                                    if (array_of_suggestions.length > 0){
                                        let autocorrect = require('autocorrect')({words: array_of_suggestions});
                                        let correct_word = autocorrect(word);
                
                                        let num = array_of_words.length - 1;
                
                                        if (num === i){
                                            new_text = new_text + correct_word;
                                        } else {
                                            new_text = new_text + correct_word + " ";
                                        }
                                    }

                                    let obj = {
                                        bad: bad_word,
                                        better: array_of_suggestions,
                                        type: error_type
                                    }

                                    array_of_errors.push(obj);
                                }
                            }

                            if (array_of_errors.length > 0){
                                if (typeof new_text === 'string' || new_text instanceof string){
                                    res.statusCode = 200;
                                    res.json({ status: true, msg: 'Text autocorrected successfully!', errors: array_of_errors, autocorrected_text: new_text });
                                } else {
                                    res.statusCode = 200;
                                    res.json({ status: true, msg: 'Text autocorrected successfully!', errors: array_of_errors, autocorrected_text: text });
                                }
                            } else {
                                res.statusCode = 200;
                                res.json({ status: true, msg: 'Text autocorrected successfully!', errors: [], autocorrected_text: new_text });
                            }
                            //---------------------------------------------------------
                        }); 
                } else {
                    res.statusCode = 401;
                    res.json({ status: false, msg: 'Please type a word or sentence!' });
                }
            } else {
                res.statusCode = 401;
                res.json({ status: false, msg: 'Please type a word or sentence!' });
            }
        } else {
            res.statusCode = 401;
            res.json({ status: false });
        }
        //--------------------------------------------------------------
    } else {
        res.statusCode = 401;
        res.json({ status: false });
    }
    //--------------------------------------------
}

module.exports = autocorrect;