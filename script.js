document.addEventListener('DOMContentLoaded', function () {
    const modeToggle = document.getElementById("modeToggle");
    const body = document.body;

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        modeToggle.textContent = "☀️ Light Mode";
    }

    modeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            modeToggle.textContent = "☀️ Light Mode";
        } else {
            localStorage.setItem("theme", "light");
            modeToggle.textContent = "🌙 Dark Mode";
        }
    });

    document.querySelectorAll('.carousel-container').forEach((carousel, index) => {
        let currentIndex = 0;
        const images = carousel.querySelector('.carousel-images');
        const totalImages = carousel.querySelectorAll('.carousel-image').length;

        function updateCarousel() {
            images.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        function nextImage() {
            currentIndex = (currentIndex < totalImages - 1) ? currentIndex + 1 : 0;
            updateCarousel();
        }

        function prevImage() {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalImages - 1;
            updateCarousel();
        }

        document.querySelector('.nav-arrow-next').addEventListener('click', nextImage);
        document.querySelector('.nav-arrow-prev').addEventListener('click', prevImage);
    });
    window.onload = () => {
        const carousel = document.querySelector('.marquis-images');
      const items = document.querySelectorAll('.marquis-image');
      const totalImages = items.length; 
      const itemsToShow = 3;
      const slideInterval = 3000; 

      for (let i = 0; i < itemsToShow; i++) {
        carousel.appendChild(items[i].cloneNode(true));
      }

      let index = 0;
      const firstItem = document.querySelector('.marquis-image');
      const slideWidth = firstItem.offsetWidth + 30;

      setInterval(() => {
        index++;
        carousel.style.transition = 'transform 0.5s ease-in-out';
        carousel.style.transform = `translateX(-${index * slideWidth}px)`;

        if (index === totalImages) {
          setTimeout(() => {
            carousel.style.transition = 'none';
            index = 0;
            carousel.style.transform = 'translateX(0px)';
          }, 500); 
        }
      }, slideInterval); 
      };
      
});