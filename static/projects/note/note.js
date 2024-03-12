// note.js

var templates = {};

function createTemplate(template){
    return function (data){
        // The target elements
        let $target = document.createElement("div");
        // Copy HTML from template to target
        $target.innerHTML = template.innerHTML;

        // Get all templateable child elements
        let context = {}; // Create a context
        for (let $elem of  $target.querySelectorAll("[data-template]")){
            context[$elem.getAttribute("data-template")] = $elem; // Set the name of the template atribute to the element
        }

        // Copy all attributes except for ID
        Array.from(template.attributes).map(x => (x.name) != "id" ? $target.setAttribute(x.name, x.value) : 0);
        // Easy way to identify all instances
        $target.setAttribute("data-template-instance", true);

        // Iterate over context and set each item of context to the associated value
        Object.entries(context).forEach(([key, $value]) => {
            $value.innerHTML = data[key];
        });
        return $target;
    }
}

function getAllTemplates(){
    return document.querySelectorAll("[data-template-name]:not([data-template-instance])");
}

function getAllTemplateInstances(){
    return document.querySelectorAll("[data-template-name][data-template-instance='true'")
}

// Make sure templates are in `templates`
function ensureTemplates(){
    for (let $elem of getAllTemplates()){
        templates[$elem.getAttribute("data-template-name")] = createTemplate($elem);
    }
}

// Create a new note
function newNote(event){
    // Context
    let context = {
        body: document.querySelector("#new-note-body").innerHTML,
        // TODO: Get a JavaScript formatter
        title: new Date().toLocaleDateString(undefined, {month:"2-digit", day: "2-digit", year: "numeric", hour:"2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short"})
    };
    // create a new note
    let $target = templates.note(context);

    // Make sure to ensure event listener
    // Delete should delete element and update storage
    $target.querySelector(".note-card-delete").addEventListener("click", (e) => $target.remove());
    $target.querySelector(".note-card-delete").addEventListener("click", updateSave);
    // Typing should update storage
    $target.querySelector(".note-card-body").addEventListener("keyup", updateSave)

    document.querySelector("#notes").appendChild($target);

    if (event){
        updateSave();
    }

    return $target;
}

function updateSave(){
    let save = [];
    // Loop through every template
    for ($elem of getAllTemplateInstances()){
        let line = {};
        // Get all template keys, store name and value
        for ($e of $elem.querySelectorAll("[data-template]")){
            line[$e.getAttribute("data-template")] = $e.innerHTML;
        }
        save.push(line);
    }
    localStorage.setItem("notes", JSON.stringify(save));
}

function loadSave(){
    let save = localStorage.getItem("notes");
    if (save){
        // For every item in save
        JSON.parse(save).forEach((item) => {
            // Create a note note
            let $target = newNote();
            for ($elem of $target.querySelectorAll("[data-template]")){
                $elem.innerHTML = item[$elem.getAttribute("data-template")];
            }
        });
    }

}

document.addEventListener("DOMContentLoaded", (event) => {
    ensureTemplates();
    loadSave();
    // `updateSave` is inside `newNote`
    document.getElementById("new-note-submit").addEventListener("click", newNote);
});