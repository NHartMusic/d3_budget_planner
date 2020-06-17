const dimensions = { height: 300, width: 300, radius: 150 }
const centre = { x: (dimensions.width / 2 + 5), y: (dimensions.height / 2 + 5) }

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dimensions.width + 150)
    .attr('height', dimensions.height + 150)

const graph = svg.append('g')
    .attr('transform', `translate(${centre.x}, ${centre.y})`)

const pie = d3.pie()
    .sort(null)
    .value(d => d.cost)

const arcPath = d3.arc()
    .outerRadius(dimensions.radius)
    .innerRadius(dimensions.radius / 2)

const colour = d3.scaleOrdinal(d3['schemeSet1'])
const t3 = d3.transition().duration(750)

//update function 

const update = (data) => {

    //update color scale domain 
    colour.domain(data.map(d => d.name))

    //join enhanced pie data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data))

    //exit selection 
    paths.exit()
        .transition(t3)
        .attrTween('d', arcTweenExit)
        .remove()

    //dom path updates
    paths.attr('d', arcPath)
        .transition(t3)
        .attrTween('d', arcTweenUpdate)

    paths.enter()
        .append('path')
        .attr('class', 'arc')
        .attr('d', arcPath)
        .attr('stroke', '#000000')
        .attr('stroke-width', 3)
        .attr('fill', d => colour(d.data.name))
        .each(function (d) { this._current = d })
        .transition(t3)
        .attrTween('d', arcTweenEnter)
}

let data = []

db.collection('expenses').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id }

        switch (change.type) {
            case 'added':
                data.push(doc)
                break
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id)
                data[index] = doc
                break
            case 'removed':
                data = data.filter(item => item.id !== doc.id)
                break
            default:
                break
        }
    })

    update(data)
})

const arcTweenEnter = (d) => {
    let i = d3.interpolate(d.endAngle, d.startAngle)

    return function (t) {
        d.startAngle = i(t)
        return arcPath(d)
    }
}

const arcTweenExit = (d) => {
    let i = d3.interpolate(d.startAngle, d.endAngle)

    return function (t) {
        d.startAngle = i(t)
        return arcPath(d)
    }
}

// use function keyword to allow use of 'this'

function arcTweenUpdate(d) {
    console.log(this._current, d)
}

