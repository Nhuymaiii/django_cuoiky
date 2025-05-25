function drawChartQ14() {
    const svgId = "#chart-Q14";
    const svg = d3.select(svgId);
    svg.selectAll("*").remove();

    // Sử dụng q14_values từ Django view, giả định cấu trúc: [{type: "Entire home/apt", average: 8.5}, ...]
    const averages = q14_values
        .map(item => ({
            type: item.room_type || "Không xác định",
            average: +item.average.toFixed(2) // Làm tròn đến 2 chữ số thập phân
        }))
        .sort((a, b) => d3.descending(a.average, b.average)); // Sắp xếp giảm dần theo điểm trung bình

    // Định nghĩa kích thước và lề
    const margin = { top: 30, right: 100, bottom: 30, left: 80 },
          width = 350 - margin.left - margin.right,
          height = averages.length * 65; // Điều chỉnh chiều cao cho tất cả loại phòng

    const svgGroup = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(averages, d => d.average) || 10]) // Thang điểm tối đa 10
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
        .attr("width", d => xScale(d.average))
        .attr("fill", d => colorScale(d.type))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Loại phòng:</strong> ${d.type}<br>
                          <strong>Trung bình điểm:</strong> ${d.average}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 5) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Thêm nhãn số
    svgGroup.selectAll(".label")
        .data(averages)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.average) + 2)
        .attr("y", d => yScale(d.type) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d.average);

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
        .text("Trung bình điểm theo loại phòng");
}

// Xử lý lỗi
window.addEventListener('error', (event) => {
    if (event.message.includes("Cannot read properties of undefined")) {
        d3.select("#chart-Q14").append("text")
            .attr("x", 50)
            .attr("y", 50)
            .text("Không thể tải dữ liệu. Vui lòng kiểm tra dữ liệu từ view.");
    }
});