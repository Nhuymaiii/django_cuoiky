function drawChartQ12() {
    const svgId = "#chart-Q12";
    const svg = d3.select(svgId);
    svg.selectAll("*").remove();

    // Sử dụng q12_values từ Django view, giả định cấu trúc giống q7_values
    const counts = q12_values.map(item => ({
        name: item.name,
        count: item.count
    })).sort((a, b) => d3.descending(a.count, b.count)); // Sắp xếp giảm dần theo count

    // Định nghĩa kích thước và lề
    const margin = { top: 30, right: 100, bottom: 30, left: 80 },
          width = 350 - margin.left - margin.right,
          height = counts.length * 38; // Điều chỉnh chiều cao cho ~5 tiện ích

    const svgGroup = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(counts, d => d.count) || 1]) // Đảm bảo domain không âm
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(counts.map(d => d.name))
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
        .data(counts)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.name))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.count))
        .attr("fill", d => colorScale(d.name))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Tiện ích:</strong> ${d.name}<br>
                          <strong>Số lượng:</strong> ${d.count}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 5) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Thêm nhãn số
    svgGroup.selectAll(".label")
        .data(counts)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.count) + 2)
        .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d.count);

    // Thêm trục
    svgGroup.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    svgGroup.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    // Thêm tiêu đề
    svgGroup.append("text")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#d1495b")
        .text("Số lượng nơi lưu trú theo tiện ích an toàn");
}

// Xử lý lỗi
window.addEventListener('error', (event) => {
    if (event.message.includes("Cannot read properties of undefined")) {
        d3.select("#chart-Q12").append("text")
            .attr("x", 50)
            .attr("y", 50)
            .text("Không thể tải dữ liệu. Vui lòng kiểm tra dữ liệu từ view.");
    }
});