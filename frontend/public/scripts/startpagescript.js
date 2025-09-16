const initStart = () => {
    const startPageBtn = document.getElementById("start-page-btn");
    const startPage = document.getElementById("start-page")
    const appPage = document.getElementById("app");

    startPageBtn.addEventListener("click", () => {
        if(startPage.classList.contains("active")) startPage.classList.remove("active");
        if(!appPage.classList.contains("active")) appPage.classList.add("active");
    })
}

document.addEventListener('DOMContentLoaded', initStart);