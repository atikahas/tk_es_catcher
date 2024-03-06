function map(data) {

                var width = 500;
                var height = 500;

                var projection = d3.geoMercator()
                    // .center([1, 0]) // centering the map
                    .scale(3500 + 5 * 100) // scaling the map
                    .rotate([-112.5 + 5 / 2, -4]);
                d3.json("malaysia.json").then(function (malaysia) {

                    var svg = d3.select(".map").append("svg")
                        .attr('class', 'map')
                        //    .attr("width", width)
                        //    .attr("height", height);
                        .attr('viewBox', [0, 0, width, height].join(' ')) // fill screen
                        ;
                    svg.append('defs')
                        .html(`
                            <filter id="fshadow02" filterUnits="objectBoundingBox" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="BlurAlpha"/>
                                <feOffset in="BlurAlpha" dx="1" dy="1" result="OffsetBlurAlpha"/>
                                <feMerge>
                                <feMergeNode in="OffsetBlurAlpha"/>
                                <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>

                            `);

                    // const legend = d3Legend.legendColor()
                    //     .shapeWidth(30)
                    //     .shapePadding(10)
                    //     .scale(colorScale);

                    var path = d3.geoPath()
                        .projection(projection)
                    // .call(legend);

                    var g = svg.append("g");
                    var my = svg.append("g").attr('class', 'map-malaysia');

                    var states = topojson.feature(malaysia, malaysia.objects.states);
                    var land = topojson.feature(malaysia, malaysia.objects.land);

                    //=====================
                    // shift sabah/sarawak/labuan closer to semenanjung
                    //=====================

                    [land, states].forEach(d => {
                        d.features
                            .forEach(d => {
                                d.geometry.coordinates.forEach(d => {
                                    if (d.length == 2) {
                                        _shift(d);
                                    } else {
                                        d[0].forEach(_shift);
                                    }
                                });
                            });
                    });


                    function _shift(d, n) {
                        if (!n) n = 0;
                        n++;

                        if (typeof d == 'object' && d.length == 2) {

                            // apple shift for longitude > 5
                            if (d[0] > 105) d[0] += -5;

                        }

                        return d;
                    }


                    //=====================
                    //
                    //=====================

                    my.selectAll(".land")
                        .data(land.features)
                        .enter()
                        .append("path")
                        .attr("class", "land")
                        .attr("d", path)
                        .style("stroke-width", 1)
                        .style("stroke-color", '#cacaca')

                    // .attr('filter', 'url(#fshadow02)');

                    states.features.forEach(d => {

                        // join map id with flag id
                        d.properties.flag_id = {
                            1: { flag_id: 1, negeri: "Johor" },
                            2: { flag_id: 2, negeri: "Kedah" },
                            3: { flag_id: 3, negeri: "Kelantan" },
                            4: { flag_id: 14, negeri: "W.P Kuala Lumpur" },
                            5: { flag_id: 15, negeri: "W.P Labuan" },
                            6: { flag_id: 4, negeri: "Melaka" },
                            7: { flag_id: 5, negeri: "Negeri Sembilan" },
                            8: { flag_id: 6, negeri: "Pahang" },
                            9: { flag_id: 8, negeri: "Perak" },
                            10: { flag_id: 9, negeri: "Perlis" },
                            11: { flag_id: 7, negeri: "Pulau Pinang" },
                            12: { flag_id: 16, negeri: "W.P Putrajaya" },
                            13: { flag_id: 12, negeri: "Sabah" },
                            14: { flag_id: 13, negeri: "Sarawak" },
                            15: { flag_id: 10, negeri: "Selangor" },
                            16: { flag_id: 11, negeri: "Terengganu" },
                        }[d.properties.id].flag_id;

                    });

                    // console.log('states', states);



                    var statesEnter = my.selectAll(".state")
                        .data(states.features)
                        .enter();

                    statesEnter.append("clipPath")
                        .attr("class", "mask")
                        .attr("id", function (d) { return "clip" + d.properties.id; })
                        .append("path")
                        .attr("d", path);

                    // statesEnter.append("image")
                    //     //.attr("xlink:href",function(d){return flags[d.properties.id].img;})
                    //     .attr("xlink:href", function (d) { return 'flag/' + d.properties.flag_id + '.png'; })
                    //     .attr("x", function (d) { return path.bounds(d)[0][0]; })
                    //     .attr("y", function (d) { return path.bounds(d)[0][1]; })
                    //     .attr("width", function (d) { var bounds = path.bounds(d); return bounds[1][0] - bounds[0][0]; })
                    //     .attr("height", function (d) { var bounds = path.bounds(d); return bounds[1][1] - bounds[0][1]; })
                    //     .attr("preserveAspectRatio", "none")
                    //     .attr("clip-path", function (d) { return "url(#clip" + d.properties.id + ")"; });

                    statesEnter.append("path")
                        .attr("class", "states")
                        .attr("d", path)
                        .style("stroke", "white")
                        .style("fill", d => {
                            var stateid = d.properties.flag_id
                            var newData = dataset.filter(d => d.stateid == stateid)
                            if (newData != '') {
                                return '#1E3A88'
                            }
                            else {
                                return 'none'
                            }
                        })
                        .style("stroke-width", "1px")
                        ;



                    states.features.forEach(d => {

                        // join map id with negeri
                        d.properties.negeri = {
                            1: { flag_id: 1, negeri: "Johor" },
                            2: { flag_id: 2, negeri: "Kedah" },
                            3: { flag_id: 3, negeri: "Kelantan" },
                            4: { flag_id: 14, negeri: "W.P Kuala Lumpur" },
                            5: { flag_id: 15, negeri: "W.P Labuan" },
                            6: { flag_id: 4, negeri: "Melaka" },
                            7: { flag_id: 5, negeri: "Negeri Sembilan" },
                            8: { flag_id: 6, negeri: "Pahang" },
                            9: { flag_id: 8, negeri: "Perak" },
                            10: { flag_id: 9, negeri: "Perlis" },
                            11: { flag_id: 7, negeri: "Pulau Pinang" },
                            12: { flag_id: 16, negeri: "W.P Putrajaya" },
                            13: { flag_id: 12, negeri: "Sabah" },
                            14: { flag_id: 13, negeri: "Sarawak" },
                            15: { flag_id: 10, negeri: "Selangor" },
                            16: { flag_id: 11, negeri: "Terengganu" },
                        }[d.properties.id].negeri;
                        // console.log('asd', d.properties.id)

                    });

                    // console.log('states.features', states.features);
                    var div = d3.select("body").append("div")
                    my.selectAll(".state")
                        .data(states.features)
                        .enter()
                        .append('path')
                        // .style("opacity", 0)
                        .attr('opacity', '0')
                        .style("stroke", 'white')
                        .on('mouseover', function (d, i) {
                            d3.select(this)
                                .transition()
                                .duration('10')
                                .attr('opacity', '0.2')
                            // .attr('transform', 'translate(1.1)')
                        })
                        .on('mouseout', function (d, i) {
                            d3.select(this)
                                .transition()
                                .duration('10')
                                .attr('opacity', '0')
                            // .attr('transform', 'scale(1)')
                        })
                        .on('click', function (d, i) {

                            var stateid = i.properties.flag_id
                            var newData = dataset.filter(d => d.stateid == stateid)
                            // console.log('data', dataset.filter(d => d.stateid == stateid))
                            if (newData != '') {
                                var stateid1 = i.properties.flag_id;
                                // var big = smol.toUpperCase();
                                // console.log(i)
                                var tah = data.filter(data => data.stateid == stateid1)
                                // console.log('cek', big)
                                console.log('s', tah)
                                alterData(tah)
                                renderTable(tah)
                                if (tah[0]["Jumlah \nBelum Keluar"] == "NaN") {
                                    window.location.reload();
                                }
                                current(tah);
                            }

                        })
                        .attr('d', path)
                        .attr('fill', 'white')
                        .attr('stroke', '#ddd')

                    var states = svg.selectAll('.state')
                        .data(states.features)
                        .enter()
                        .append('g')
                        .attr('id', 'labels')

                    // Append label text
                    d3.selectAll('#labels')
                        .append('text')
                        .attr('x', d => path.centroid(d)[0])
                        .attr('y', d => path.centroid(d)[1])
                        // .attr('fill', '#00f')
                        .attr('fill', '#ffff')
                        .text(d => {
                            var stateid = d.properties.flag_id
                            var newData = dataset.filter(d => d.stateid == stateid)
                            // console.log('data', dataset.filter(d => d.stateid == stateid))
                            if (newData != '') {
                                var jumlahTurnout = d3.sum(newData, d => d['Jumlah\nTurnout'])
                                var jumlahPengundi = d3.sum(newData, d => d['Jumlah Pengundi PRN-23'])
                                var percTurnout = (jumlahTurnout / jumlahPengundi * 100).toFixed(2)
                                // console.log('asdasd',(jumlahTurnout/jumlahPengundi*100).toFixed(2))
                                return d.properties.negeri.toUpperCase() + ' (' + percTurnout + ' %)'
                            }
                            // else {
                            //     return d.properties.negeri.toUpperCase()
                            // }


                        })
                        .style('font-family', 'Sans-serif')

                        // Reposition labels  
                        .attr('x', d => {
                            const x = path.centroid(d)[0];
                            const side = width / 2

                            // console.log(side/4)
                            const margins = {
                                left: 800,
                                right: -250,
                                right1: 50,
                                left1: 470
                            }

                            if (d.properties.flag_id == 3 || d.properties.flag_id == 11 || d.properties.flag_id == 6 || d.properties.flag_id == 15 || d.properties.flag_id == 14) {
                                if (x < side) {
                                    return margins.right1;
                                }
                                else {
                                    return margins.left1
                                }
                            }

                            else {
                                if (x > side) {
                                    // Right side
                                    return margins.left;
                                } else {
                                    // Left side  
                                    return margins.right;
                                }
                            }



                        })
                        .attr('y', d => {

                            // console.log(d.properties.flag_id, d.properties.negeri)
                            var w = width / 2
                            // console.log(w)
                            var h = height / 14
                            var h2 = height / 4

                            //semenanjung
                            if (d.properties.flag_id == 9) {
                                return 1 * h
                            }
                            if (d.properties.flag_id == 2) {
                                return 3 * h
                            }
                            if (d.properties.flag_id == 7) {
                                return 4 * h
                            }
                            if (d.properties.flag_id == 3) {
                                return 4 * h
                            }
                            if (d.properties.flag_id == 11) {
                                return 5 * h
                            }
                            if (d.properties.flag_id == 8) {
                                return 6 * h
                            }
                            if (d.properties.flag_id == 6) {
                                return 7 * h
                            }
                            if (d.properties.flag_id == 10) {
                                return 7 * h
                            }
                            if (d.properties.flag_id == 14) {
                                return 8 * h
                            }
                            if (d.properties.flag_id == 16) {
                                return 9 * h
                            }
                            if (d.properties.flag_id == 5) {
                                return 10 * h
                            }
                            if (d.properties.flag_id == 4) {
                                return 11 * h
                            }
                            if (d.properties.flag_id == 1) {
                                return 12 * h
                            }


                            //kalimantan
                            if (d.properties.flag_id == 15) {
                                return 1 * h2
                            }
                            if (d.properties.flag_id == 12) {
                                return 2 * h2
                            }
                            if (d.properties.flag_id == 13) {
                                return 3 * h2
                            }

                        })

                        // Set anchor based on position
                        .style('text-anchor', d => {

                            if (d.properties.flag_id == 3 || d.properties.flag_id == 11 || d.properties.flag_id == 6 || d.properties.flag_id == 14) {
                                return path.centroid(d)[0] > width / 2 ?
                                    'end' :
                                    'start';
                            }
                            else {
                                return path.centroid(d)[0] > width / 2 ?
                                    'start' :
                                    'end';
                            }

                        })
                        .attr('id', d => `label-${d.id}`)
                        .on('mouseover', function (d, i) {
                            d3.select(this).transition()
                                .duration('10')
                                .attr('font-color', 'blue')
                        })

                    d3.selectAll('#labels')
                        .append('circle')
                        .attr('cx', d => path.centroid(d)[0])
                        .attr('cy', d => path.centroid(d)[1])
                        .attr('r', d => {
                            var stateid = d.properties.flag_id
                            var newData = dataset.filter(d => d.stateid == stateid)
                            if (newData != '') {
                                return 3
                            }
                            else {
                                return null
                            }
                        })
                        .attr('fill', d => {
                            var stateid = d.properties.flag_id
                            var newData = dataset.filter(d => d.stateid == stateid)
                            if (newData != '') {
                                return 'white'
                            }
                            else {
                                return null
                            }
                        })

                    d3.selectAll('#labels')
                        .append('line')
                        .attr('id', d => `${d.id}-line`)
                        .attr('x1', d => {
                            return path.centroid(d)[0]
                        })
                        .attr('y1', d => {

                            // console.log(d.properties.flag_id, d.properties.negeri)
                            var w = width / 2
                            // console.log(w)
                            var h = height / 14
                            var h2 = height / 4

                            //semenanjung
                            if (d.properties.flag_id == 9) {
                                return 1 * h - 5
                            }
                            if (d.properties.flag_id == 2) {
                                return 3 * h - 5
                            }
                            if (d.properties.flag_id == 7) {
                                return 4 * h - 5
                            }
                            if (d.properties.flag_id == 3) {
                                return 4 * h - 5
                            }
                            if (d.properties.flag_id == 11) {
                                return 5 * h - 5
                            }
                            if (d.properties.flag_id == 8) {
                                return 6 * h - 5
                            }
                            if (d.properties.flag_id == 6) {
                                return 7 * h - 5
                            }
                            if (d.properties.flag_id == 10) {
                                return 7 * h - 5
                            }
                            if (d.properties.flag_id == 14) {
                                return 8 * h - 5
                            }
                            if (d.properties.flag_id == 16) {
                                return 9 * h - 5
                            }
                            if (d.properties.flag_id == 5) {
                                return 10 * h - 5
                            }
                            if (d.properties.flag_id == 4) {
                                return 11 * h - 5
                            }
                            if (d.properties.flag_id == 1) {
                                return 12 * h - 5
                            }


                            //kalimantan
                            if (d.properties.flag_id == 15) {
                                return 1 * h2
                            }
                            if (d.properties.flag_id == 12) {
                                return 2 * h2
                            }
                            if (d.properties.flag_id == 13) {
                                return 3 * h2
                            }

                        })
                        .attr('y2', d => {


                            //semenanjung
                            if (d.properties.flag_id == 1) {
                                return path.centroid(d)[1] + 40
                            }
                            if (d.properties.flag_id == 4) {
                                return path.centroid(d)[1] + 10
                            }
                            if (d.properties.flag_id == 15) {
                                return path.centroid(d)[1]
                            }
                            if (d.properties.flag_id == 15) {
                                return path.centroid(d)[1]
                            }

                            //kalimantan
                            if (d.properties.flag_id == 13) {
                                return path.centroid(d)[1]
                            }
                            if (d.properties.flag_id == 12) {
                                return path.centroid(d)[1] + 50
                            }
                            if (d.properties.flag_id == 15) {
                                return path.centroid(d)[1]
                            }

                            return path.centroid(d)[1]
                        })
                        // Point left or right
                        .attr('x2', d => {
                            return path.centroid(d)[0]
                        })
                        .style('stroke', d => {
                            var stateid = d.properties.flag_id
                            var newData = dataset.filter(d => d.stateid == stateid)
                            if (newData != '') {
                                return 'white'
                            }
                            else {
                                return null
                            }
                        })


                    d3.selectAll('#labels')
                        .append('line')
                        .attr('id', d => `${d.id}-line`)
                        .attr('x1', d => { return d3.select(`#label-${d.id}`).attr('x'); })
                        .attr('y1', d => {

                            // console.log(d.properties.flag_id, d.properties.negeri)
                            var w = width / 2
                            // console.log(w)
                            var h = height / 14
                            var h2 = height / 4

                            //semenanjung
                            if (d.properties.flag_id == 9) {
                                return 1 * h - 5
                            }
                            if (d.properties.flag_id == 2) {
                                return 3 * h - 5
                            }
                            if (d.properties.flag_id == 7) {
                                return 4 * h - 5
                            }
                            if (d.properties.flag_id == 3) {
                                return 4 * h - 5
                            }
                            if (d.properties.flag_id == 11) {
                                return 5 * h - 5
                            }
                            if (d.properties.flag_id == 8) {
                                return 6 * h - 5
                            }
                            if (d.properties.flag_id == 6) {
                                return 7 * h - 5
                            }
                            if (d.properties.flag_id == 10) {
                                return 7 * h - 5
                            }
                            if (d.properties.flag_id == 14) {
                                return 8 * h - 5
                            }
                            if (d.properties.flag_id == 16) {
                                return 9 * h - 5
                            }
                            if (d.properties.flag_id == 5) {
                                return 10 * h - 5
                            }
                            if (d.properties.flag_id == 4) {
                                return 11 * h - 5
                            }
                            if (d.properties.flag_id == 1) {
                                return 12 * h - 5
                            }


                            //kalimantan
                            if (d.properties.flag_id == 15) {
                                return 1 * h2
                            }
                            if (d.properties.flag_id == 12) {
                                return 2 * h2
                            }
                            if (d.properties.flag_id == 13) {
                                return 3 * h2
                            }

                        })
                        .attr('y2', d => {

                            // console.log(d.properties.flag_id, d.properties.negeri)
                            var w = width / 2
                            // console.log(w)
                            var h = height / 14
                            var h2 = height / 4

                            //semenanjung
                            if (d.properties.flag_id == 9) {
                                return 1 * h - 5
                            }
                            if (d.properties.flag_id == 2) {
                                return 3 * h - 5
                            }
                            if (d.properties.flag_id == 7) {
                                return 4 * h - 5
                            }
                            if (d.properties.flag_id == 3) {
                                return 4 * h - 5
                            }
                            if (d.properties.flag_id == 11) {
                                return 5 * h - 5
                            }
                            if (d.properties.flag_id == 8) {
                                return 6 * h - 5
                            }
                            if (d.properties.flag_id == 6) {
                                return 7 * h - 5
                            }
                            if (d.properties.flag_id == 10) {
                                return 7 * h - 5
                            }
                            if (d.properties.flag_id == 14) {
                                return 8 * h - 5
                            }
                            if (d.properties.flag_id == 16) {
                                return 9 * h - 5
                            }
                            if (d.properties.flag_id == 5) {
                                return 10 * h - 5
                            }
                            if (d.properties.flag_id == 4) {
                                return 11 * h - 5
                            }
                            if (d.properties.flag_id == 1) {
                                return 12 * h - 5
                            }


                            //kalimantan
                            if (d.properties.flag_id == 15) {
                                return 1 * h2
                            }
                            if (d.properties.flag_id == 12) {
                                return 2 * h2
                            }
                            if (d.properties.flag_id == 13) {
                                return 3 * h2
                            }

                        })
                        // Point left or right
                        .attr('x2', d => {
                            console.log(d.properties.flag_id, d.properties.negeri)

                            //semenanjung
                            if (d.properties.flag_id == 1) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 2) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 3) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 4) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 5) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 6) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 7) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 8) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 9) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 10) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 11) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 16) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 14) {
                                return path.centroid(d)[0]
                            }


                            //kalimantan
                            if (d.properties.flag_id == 13) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 12) {
                                return path.centroid(d)[0]
                            }
                            if (d.properties.flag_id == 15) {
                                return path.centroid(d)[0]
                            }

                        })
                        .style('stroke', d => {
                            var stateid = d.properties.flag_id
                            var newData = dataset.filter(d => d.stateid == stateid)
                            if (newData != '') {
                                return 'white'
                            }
                            else {
                                return null
                            }
                        })
                    // my.selectAll("text")
                    //     .data(states.features)
                    //     .enter()
                    //     .append('text')
                    //     .attr('x', d => path.centroid(d)[0])
                    //     .attr('y', d => path.centroid(d)[1])
                    //     .attr('fill', '#00f')
                    //     .attr('text-anchor', 'middle')
                    //     .text(d => d.properties.negeri)




                });
                // console.log(data[0].Negeri)
                // function scrollToDiv(divPosition) {

                //     d3.transition()
                //         .duration(500)
                //         .tween("scroll", scrollTween);

                //     function scrollTween() {
                //         const i = d3.interpolateNumber(window.pageYOffset, divPosition);
                //         return t => window.scrollTo(0, i(t));
                //     }

                // }

            }