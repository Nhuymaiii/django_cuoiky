function drawChartQ5() {
    const svgId = "#chart-Q5";
    const svg = d3.select(svgId);
    svg.selectAll("*").remove();

    // Dữ liệu đã được xử lý trong view Django
    const pieData = q5_values.map(item => ({
        policy: item.policy || "Không xác định",
        count: item.count,
        percent: item.percent
    }));

    // Kích thước và lề
    const width = 375; // Khớp với max-width: 350px trong CSS
    const height = 275; // Khớp với max-height: 250px trong CSS
    const radius = 90; // Bán kính pie chart

    const color = d3.scaleOrdinal(d3.schemeSet2);

    // Dịch chuyển pie chart sang trái để có không gian cho legend bên phải
    const svgGroup = d3.select(svgId)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${(width / 2) - 50}, ${height / 2})`);

    const pie = d3.pie().value(d => d.count).sort(null);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = pie(pieData);

    // Vẽ các phần của pie chart với tooltip
    const paths = svgGroup.selectAll("path")
        .data(arcs)
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.policy))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`Chính sách: ${d.data.policy}<br>Số lượng: ${d.data.count}<br>Phần trăm: ${d3.format(".2f")(d.data.percent)}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", (event) => {
            d3.select("#tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    // Thêm legend bên phải
    const legend = d3.select(svgId)
        .append("g")
        .attr("transform", `translate(${width - 120}, ${height / 2 - pieData.length * 7.5})`);

    pieData.forEach((d, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 15})`);

        // Hình vuông màu (giảm kích thước)
        legendRow.append("rect")
            .attr("width", 5)
            .attr("height", 5)
            .attr("fill", color(d.policy));

        // Tên chính sách (giảm kích thước chữ)
        legendRow.append("text")
            .attr("x", 7)
            .attr("y", 7)
            .style("font-size", "8px")
            .style("font-family", "Calibri, sans-serif")
            .text(d.policy);
    });

    // Tiêu đề
    svgGroup.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#d1495b")
        .style("font-weight", "bold")
        .text("Chính sách hủy phòng");
}

// Xử lý lỗi (nếu có)
window.addEventListener('error', (event) => {
    if (event.message.includes("Cannot read properties of undefined")) {
        d3.select("#chart-Q5").append("text")
            .attr("x", 50)
            .attr("y", 50)
            .text("Không thể tải dữ liệu. Vui lòng kiểm tra dữ liệu từ view.");
    }
});