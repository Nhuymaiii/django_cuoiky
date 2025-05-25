function drawChartQ6() {
    const svgId = "#chart-Q6";
    const svg = d3.select(svgId);
    svg.selectAll("*").remove();

    // Dữ liệu đã được xử lý trong view Django
    const averages = q6_values.map(item => ({
        type: item.type || "Không xác định",
        avgPrice: item.avgPrice
    })).sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 10); // Lấy top 10

    // Giảm kích thước và lề
    const margin = { top: 30, right: 100, bottom: 30, left: 80 },
          width = 350 - margin.left - margin.right,
          height = averages.length * 18;

    const svgGroup = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(averages, d => d.avgPrice)])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(averages.map(d => d.type))
        .range([0, height])
        .padding(0.2);

    const colorScale = d3.scaleOrdinal(d3.schemeSet2);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "3px 5px")
        .style("border", "1px solid #000")
        .style("border-radius", "3px")
        .style("visibility", "hidden")
        .style("font-size", "10px")
        .style("text-align", "left");

    // Vẽ các thanh
    svgGroup.selectAll(".bar")
        .data(averages)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.type))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.avgPrice))
        .attr("fill", d => colorScale(d.type))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Loại bất động sản:</strong> ${d.type}<br>
                          <strong>Trung bình giá thuê:</strong> ${d3.format(".2f")(d.avgPrice)}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 5) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Nhãn số
    svgGroup.selectAll(".label")
        .data(averages)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.avgPrice) + 2)
        .attr("y", d => yScale(d.type) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d3.format(".2f")(d.avgPrice));

    // Trục
    svgGroup.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    svgGroup.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(3))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    // Tiêu đề
    svgGroup.append("text")
        .attr("x", (width) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#d1495b")
        .text("Trung bình giá thuê theo loại hình bất động sản (Top 10)");
}