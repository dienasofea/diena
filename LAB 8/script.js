
document.addEventListener("DOMContentLoaded", function() {
  const contactForm = document.getElementById("contactForm");

  if (!contactForm) {
    console.error("Error: contactForm not found!");
    return; 
  }

  contactForm.addEventListener("submit", function(e) {
    e.preventDefault(); // stop page reload

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Alert confirm
    alert(`Thank you, ${name}! Your message has been received. We will get back to you soon.`);

    // Reset form
    this.reset();
  });
});
