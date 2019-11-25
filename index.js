// firstly define the dimentionals of chord chart
let height = 760
   ,width=1080;

let  outerRadius = height / 2,
    innerRadius = outerRadius - 148;
// CREAT SVG ELEMENTS
let svg = d3.select("#chord").append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("height",height)
            .attr("width",width)
            .append("g")
             .attr("transform","translate("+(outerRadius+111)+","+(outerRadius+21)+")");
// WRAPP A  title
let title = svg.append("text")
               .attr("id","title")
               .attr("x",-outerRadius - 106)
               .attr("y",-outerRadius);
wrap("flare class dependencies",(width/4),title);

// COLOR
let fill = d3.scaleOrdinal(d3.schemeDark2);

// FUNCTIONAL EXPRESTION

let chord = d3.chord()
              .padAngle(.06)
              .sortSubgroups(d3.descending)
              .sortChords(d3.descending);

let ribbon = d3.ribbon()
               .radius(innerRadius)

let arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(innerRadius + 20)


// PULL DATA
d3.json('chord.json').then(draw,logErr)

// MAIN FUNCITON

function draw(data){

  let indexByName = d3.map(),
      nameByIndex = d3.map(),
      matrix = [],
      n=0;

  // Returns Flare package name for the given class name
  function name(name){
    return name.substring(0,name.lastIndexOf(".")).substring(6)
  }
  // Compute the unique index each of the index

  data.forEach(d => {
    if(!indexByName.has(d = name(d.name))){
      nameByIndex.set(n,d)
      indexByName.set(d,n++)
    }
  });

  // COnstruct a squre matrix counting package imports

  data.forEach(d=>{
    let source = indexByName.get(name(d.name)),
        row = matrix[source]
    if(!row){
      row = matrix[source] = []
      for(let i = -1; ++i < n;) row[i] = 0;
    }
    d.imports.forEach(function(d){
      row[indexByName.get(name(d))]++;
    });
  });

  // CHORDS GROUP => ARC

  let groups = svg.selectAll("g.group")
                  .data(chord(matrix).groups)
                  .enter().append("g")
                    .classed("group",true);
  // ARC
  groups.append("path")
        .style("fill",d=>{ return fill(d.index) })
        .style("stroke",d=>{ return fill(d.index) })
        .attr("d",arc);

  // Self-wrapping Arc label
  groups.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle)/2 } )
        .attr("dy",".35em")
        .attr("transform",d=>"rotate("+(d.angle * 180 / Math.PI - 90)+")" + "translate("+(innerRadius + 26 )+ ")" + (d.angle > Math.PI ? "rotate(180)":""))
        .style("text-anchor",d=>{return d.angle > Math.PI ? "end":null })
        .each(d=>{wrap(nameByIndex.get(d.index),innerRadius / 3 ,d3.select(groups.selectAll("text").nodes()[d.index]));})
        .attr("fill",d=>fill(d.index))

  // CHORDS => RIBBONS
  let chords = svg.selectAll("path.chord").data(chord(matrix))
                  .enter().append("path").classed("chord",true)
                  .style("stroke","none")
                  .style("fill","none")
                  .transition()
                  .duration((d,i)=>i*20)
                  .delay((d,i)=>i*20)
                  .style("stroke",d=>{ return d3.rgb(fill(d.source.index)).darker(); })
                  .style("fill",d=>{return fill(d.source.index); })
                  .attr("d",ribbon);
}
// END draw function

// WRAP TEXT
function wrap(text,width,parent){
  let words = text.split(/\s/).reverse()
  if(words.length > 1){
    let word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, // mean in ems
        x = getX(parent),
        y = getY(parent),
        dy = 1.6,
        tspan = parent.text(null).append("tspan").attr("x",x).attr("y",y).attr("dy",dy+"em");
        while(word = words.pop()){
          line.push(word)
          tspan.text(line.join(""))
          if(tspan.node().getComputedTextLength() > width){
            line.pop()
            tspan.text(line.join(""))
            line = [word]
            tspan = parent.append("tspan").attr("x",x).attr("y",y).attr("dy",++lineNumber * lineHeight + dy + "em").text(word)
          }
        }
      }else{
        parent.text(text)
      }
      function getX(parent){
        if(parent.attr("x")){
          return parent.attr("x")
        }else if(parent.attr("angle")){
          return innerRadius + 26
        }
        else{
          return 0
        }
      }

      function getY(parent){
        if(parent.attr("y")){
          return parent.attr("y")
        }
        else if(parent.attr("angle")){
          if(d.angle >  Math.PI ){
            return "rotate(180)"
          }else{
            return -26
          }
        }else{
          return ""
    }
  }
}

function logErr(error){
  console.log(error);

}


d3.select(self.frameElement).style("height",outerRadius * 2 + "px")
setTimeout(function() {
  location.reload();
}, 10000);
