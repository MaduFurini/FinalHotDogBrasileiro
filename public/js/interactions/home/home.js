window.addEventListener('load', function() {
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
    }
});

window.addEventListener("scroll", function() {
    const nav = document.querySelector("nav");

    if (window.scrollY > 50) {
        nav.classList.add("fixed");
    } else {
        nav.classList.remove("fixed");
    }
});
