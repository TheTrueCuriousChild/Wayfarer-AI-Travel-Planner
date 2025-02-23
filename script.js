<<<<<<< HEAD
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
=======
document.addEventListener("DOMContentLoaded", function() {
    const width = 1100, height = 600;  // ✅ Increased width and height
    
    const svg = d3.select("#world-map")
                  .attr("viewBox", `0 0 ${width} ${height}`)
                  .attr("preserveAspectRatio", "xMidYMid meet");

    const tooltip = d3.select("#tooltip");

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then(function(world) {
            const projection = d3.geoMercator().scale(170).translate([width / 2, height / 1.5]);  // ✅ Adjusted scale
            const path = d3.geoPath().projection(projection);

            svg.selectAll("path")
                .data(world.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("stroke", "#000")
                .attr("fill", "#ccc")
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill", "#999");
                    tooltip.classed("hidden", false)
                           .style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY - 20) + "px")
                           .text(d.properties.name);
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function(event, d) {
                    d3.select(this).attr("fill", "#ccc");
                    tooltip.classed("hidden", true);
                })
                .attr("class", function(d) { return d.properties.name; });

            document.getElementById("source").addEventListener("change", updateMap);
            document.getElementById("destination").addEventListener("change", updateMap);
        });

    function updateMap() {
        const source = document.getElementById("source").value;
        const destination = document.getElementById("destination").value;

        svg.selectAll("path")
            .attr("fill", function(d) {
                if (d.properties.name === source) return "orange";
                if (d.properties.name === destination) return "skyblue";
                return "#ccc";
            });
    }

    document.getElementById("dark-mode-toggle").addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
    });
});
>>>>>>> 32b065552bbecb259f94bee09b0d74ceffb09ed2
