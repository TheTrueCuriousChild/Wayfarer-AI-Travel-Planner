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