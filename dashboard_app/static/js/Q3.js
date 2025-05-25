function drawChartQ3() {
    const svgId = "#chart-Q3";
    const svg = d3.select(svgId);
    svg.selectAll("*").remove();

    // Dữ liệu đã được xử lý trong view Django
    const counts = q3_values.map(item => ({
        range: item.price_range || "Không xác định",
        count: item.count || 0
    })).sort((a, b) => {
        if (a.range === "Không xác định") return 1;
        if (b.range === "Không xác định") return -1;
        const aStart = a.range.match(/\$(\d+)/) ? +a.range.match(/\$(\d+)/)[1] : 0;
        const bStart = b.range.match(/\$(\d+)/) ? +b.range.match(/\$(\d+)/)[1] : 0;
        return aStart - bStart;
    });

    // Kiểm tra dữ liệu, giới hạn tối đa 10 mục để tránh tràn
    const maxItems = Math.min(counts.length, 10);
    const filteredCounts = counts.slice(0, maxItems);

    // Điều chỉnh kích thước dựa trên CSS, không ghi đè hoàn toàn
    const margin = { top: 30, right: 80, bottom: 30, left: 80 },
          width = 350 - margin.left - margin.right, // Khớp với max-width trong CSS
          height = counts.length * 15; // Giảm khoảng cách giữa các thanh

    const svgGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredCounts, d => d.count)])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(filteredCounts.map(d => d.range))
        .range([0, height])
        .padding(0.2);

    const colorScale = d3.scaleOrdinal(d3.schemeSet3);

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
        .data(filteredCounts)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.range))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.count))
        .attr("fill", d => colorScale(d.range))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Khoảng giá:</strong> ${d.range}<br>
                          <strong>Số lượng lưu trú:</strong> ${d.count}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 5) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Nhãn số
    svgGroup.selectAll(".label")
        .data(filteredCounts)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.count) + 2)
        .attr("y", d => yScale(d.range) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d.count);

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
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#d1495b")
        .text("Số lượng lưu trú theo khoảng giá thuê");
}