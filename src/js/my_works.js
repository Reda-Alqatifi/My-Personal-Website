// //////////////////////////////

// ! for chosing the type of works (software , novels , arts)

const works_software = document.getElementById("works-software");
const works_novels = document.getElementById("works-novels");
const works_arts = document.getElementById("works-arts");

const software = document.getElementById("software");
const novels = document.getElementById("novels");
const arts = document.getElementById("arts");

function myWorks() {
    document.addEventListener("click" , event => {
        if (event.target.closest("#works-software a")) {
            if ( works_software.classList.contains("unselected")) {
                works_software.classList.replace("unselected" , "selected");

                works_novels.classList.replace("selected" , "unselected");
                works_arts.classList.replace("selected" , "unselected");

                novels.classList.replace("selected" , "unselected");
                arts.classList.replace("selected" , "unselected");

                software.classList.replace("unselected" , "selected");
            }
        }
        else if (event.target.closest("#works-novels a")) {
            if ( works_novels.classList.contains("unselected")) {
                works_novels.classList.replace("unselected" , "selected");

                works_software.classList.replace("selected" , "unselected");
                works_arts.classList.replace("selected" , "unselected");

                software.classList.replace("selected" , "unselected");
                arts.classList.replace("selected" , "unselected");

                novels.classList.replace("unselected" , "selected");
            }
        }
        else if (event.target.closest("#works-arts a")) {
            if ( works_arts.classList.contains("unselected")) {
                works_arts.classList.replace("unselected" , "selected");

                works_novels.classList.replace("selected" , "unselected");
                works_software.classList.replace("selected" , "unselected");

                novels.classList.replace("selected" , "unselected");
                software.classList.replace("selected" , "unselected");

                arts.classList.replace("unselected" , "selected");
            }
        }
    });
}


// //////////////////////////////

export {myWorks};
