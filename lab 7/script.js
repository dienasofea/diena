window.onload = () => {
  // Collapsible Sections
  const coll = document.querySelectorAll(".collapsible");
  coll.forEach(button => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      const content = button.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        content.classList.remove("show");
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.add("show");
      }
    });
  });

  // Slideshow
  let slideIndex = 0;
  showSlide(slideIndex);

  function changeSlide(n) {
    showSlide(slideIndex += n);
  }

  function showSlide(n) {
    const slides = document.getElementsByClassName("slide");
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    for (let slide of slides) slide.style.display = "none";
    slides[slideIndex].style.display = "block";
  }

  // Manual slide controls
  window.changeSlide = changeSlide;

  // Auto slideshow
  setInterval(() => { changeSlide(1); }, 5000);

  // Scroll Progress Bar
  window.onscroll = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById("progress-bar").style.width = scrolled + "%";
  };
};