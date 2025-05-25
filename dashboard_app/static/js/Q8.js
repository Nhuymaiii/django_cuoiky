function drawChartQ8() {
    const svgId = "#chart-Q8";
    const svg = d3.select(svgId);
    svg.selectAll("*").remove();

    // Dữ liệu đã được xử lý trong view Django
    const counts = [
        { status: "Đã đặt", count: q8_values[0].booked_count },
        { status: "Chưa đặt", count: q8_values[0].not_booked_count }
    ];

    // Giảm kích thước và lề
    const margin = { top: 30, right: 80, bottom: 15, left: 40 },
          width = 300 - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom;

    const svgGroup = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Trục X (status)
    const xScale = d3.scaleBand()
        .domain(counts.map(d => d.status))
        .range([0, width])
        .padding(0.15);

    // Trục Y (count)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(counts, d => d.count)])
        .range([height, 0]);

    // Sử dụng bảng màu d3.schemeSet2
    const colorScale = d3.scaleOrdinal()
        .domain(counts.map(d => d.status))
        .range(d3.schemeSet2);

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
        .attr("x", d => xScale(d.status))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.count))
        .attr("fill", d => colorScale(d.status))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Trạng thái:</strong> ${d.status}<br>
                          <strong>Số lượng:</strong> ${d.count}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 5) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Nhãn số (hiển thị số lượng)
    svgGroup.selectAll(".label")
        .data(counts)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.status) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.count) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .text(d => d.count);

    // Trục X (status)
    svgGroup.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    // Trục Y (giá trị)
    svgGroup.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
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
        .style("fill", "#d1495b")
        .text("Số lượng nơi lưu trú đã/chưa đặt");
}

// Xử lý lỗi (nếu có)
window.addEventListener('error', (event) => {
    if (event.message.includes("Cannot read properties of undefined")) {
        d3.select("#chart-Q8").append("text")
            .attr("x", 50)
            .attr("y", 50)
            .text("Không thể tải dữ liệu. Vui lòng kiểm tra dữ liệu từ view.");
    }
});