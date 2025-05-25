function drawChartQ4() {
    const svgId = "#chart-Q4";
    const svg = d3.select(svgId);
    svg.selectAll("*").remove();

    // Dữ liệu đã được xử lý trong view Django
    const averages = q4_values.map(item => ({
        room_type: item.room_type || "Không xác định",
        avg_price: Math.round(item.avg_price || 0)
    })).sort((a, b) => b.avg_price - a.avg_price);

    // Kiểm tra dữ liệu, giới hạn tối đa 10 mục để tránh tràn
    const maxItems = Math.min(averages.length, 10);
    const filteredAverages = averages.slice(0, maxItems);

    // Điều chỉnh kích thước dựa trên CSS, không ghi đè hoàn toàn
    const margin = { top: 30, right: 80, bottom: 50, left: 40 }, // Tăng margin.bottom để chứa nhãn xoay
          width = 300 - margin.left - margin.right, // Khớp với max-width trong CSS
          height = 200 - margin.top - margin.bottom; // Khớp với max-height trong CSS

    const svgGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Trục X (room_type)
    const xScale = d3.scaleBand()
        .domain(filteredAverages.map(d => d.room_type))
        .range([0, width])
        .padding(0.3);

    // Trục Y (avg_price)
    const yScale = d3.scaleLinear()
        .domain([0, Math.max(10, d3.max(filteredAverages, d => d.avg_price))]) // Đảm bảo domain tối thiểu
        .range([height, 0]);

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

    // Vẽ các cột dọc
    svgGroup.selectAll(".bar")
        .data(filteredAverages)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.room_type))
        .attr("y", d => yScale(d.avg_price))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.avg_price))
        .attr("fill", d => colorScale(d.room_type))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Loại phòng:</strong> ${d.room_type}<br>
                          <strong>Giá thuê TB:</strong> $${d.avg_price}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 5) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Nhãn giá trị (hiển thị trên đầu cột)
    svgGroup.selectAll(".label")
        .data(filteredAverages)
        .enter().append("text")
        .attr("x", d => xScale(d.room_type) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.avg_price) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => `$${d.avg_price}`);

    // Trục X (room_type)
    svgGroup.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif")
        .attr("transform", "rotate(-30)")
        .attr("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em");

    // Trục Y (giá trị)
    svgGroup.append("g")
        .call(d3.axisLeft(yScale).ticks(3))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    // Tiêu đề biểu đồ
    svgGroup.append("text")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#d1495b")
        .text("Giá thuê trung bình theo loại phòng");
}