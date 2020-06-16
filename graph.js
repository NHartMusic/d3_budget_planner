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

//update function 

const update = (data) => {

    //join enhanced pie data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data))

    paths.enter()
        .append('path')
        .attr('class', 'arc')
        .attr('d', arcPath)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)

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