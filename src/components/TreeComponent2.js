/**
 * @author Fine
 * @description d3 and react tree component
 */
import React from 'react';
import * as d3 from 'd3';

import CONSTANT from '../utils/CONSTANT2';

class TreeComponent2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [], // tree nodes
            links: [], // tree path
        };
        this.tree = null;
        /**
         * bezier curve generator to path
         */
        this.bezierCurveGenerator = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    }

    componentDidMount() {
        this.initMapData();
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { links, nodes } = this.initTreeNodes(nextProps);
        nextState.nodes = nodes;
        nextState.links = links;

        return true;
    }

    initMapData() {
        const { width, height, data } = this.props;
        // create tree layout
        this.tree = d3.tree()
            .size([width, height*0.65])
            .separation((a, b) => (a.parent === b.parent ? 5 : 9) / a.depth);
        const { links, nodes } = this.initTreeNodes(data);
        this.setState({ links, nodes });
    }

    initTreeNodes(nextProps) {
        const { currentNode, dataSource } = nextProps;
        let nodes = [];
        let links = [];
        if (dataSource) {
            // create data of tree structure
            const hierarchyData = d3.hierarchy(dataSource)
            // hierarchy layout and add node.x,node.y
            const treeNode = this.tree(hierarchyData);
            nodes = treeNode.descendants();
            links = treeNode.links();
            nodes = nodes.map(node => {
                if (node.active) {
                    node.active = false;
                    if (node.parent) {
                        node.parent.active = false;
                    }
                }
                if (node.data.name === currentNode.name) {
                    node.active = true;
                    if (node.parent) {
                        node.parent.active = true;
                    }
                }
                return node;
            });
        }
        return { nodes, links };
    }

    nodeActive = (event, currentNode) => {
        this.props.nodeClick(event, currentNode);
    }

    render() {
        const { width, height, tranInfo } = this.props;
        const { links, nodes } = this.state;
        return (
            <svg width={width} height={height}>
                <g
                    className="tree_map"
                    transform={`translate(${tranInfo.x},0),scale(${tranInfo.k})`}
                >
                    <g>
                        {
                            links.map((link, i) => {
                                const start = { x: link.source.x, y: link.source.y + CONSTANT.STARTBUF };
                                const end = { x: link.target.x, y: link.target.y + CONSTANT.ENDBUF };
                                const pathLink = this.bezierCurveGenerator({ source: start, target: end });
                                let stroke = CONSTANT.THEME.LINESTROKE;

                                if (link.target.data.highLight) {
                                    stroke = 'red';
                                }

                                return <path
                                    key={i}
                                    d={pathLink}
                                    fill='none'
                                    stroke={stroke}
                                    strokeWidth='1'
                                    strokeDasharray={CONSTANT.THEME.DASHARRAY}
                                    markerEnd='url(#arrow)' />
                            })
                        }
                    </g>
                    <g>
                        {nodes.map((node, i) => {
                            node.type = node.data.type;
                            node.tmp = node.data.tmp;
                            node.error = node.data.error;
                            node.avgTime = node.data.avgTime;
                            node.name = node.data.name;
                            node.fontsize = node.data.fontsize;
                            node.width = node.data.width;
                            node.id = node.data.id;
                            let textX = 1;
                            let fontSize = 8;
                            let fill = '#999';

                            const size = node.name.length;

                            let width = 80;
                            if (size == 2) {
                                width = 40;
                                textX = 15;
                            } else if (size < 5) {
                                width = 40;
                                textX = 10;
                            } else if (size < 15) {
                                width = 60;
                                textX = 8;
                            } else {
                                width = 80;
                            }
                            if (node.data.highLight == 1) {
                                fill = 'red';
                            }
                            return (
                                <g key={i} transform={`translate(${node.y}, ${node.x - 10})`}>
                                    <defs>
                                        <marker id="arrow"
                                            markerUnits="strokeWidth"
                                            markerWidth={CONSTANT.MARKER.MARKERWIDTH}
                                            markerHeight={CONSTANT.MARKER.MARKERHIEGHT}
                                            viewBox={CONSTANT.MARKER.VIEWBOX}
                                            refX={CONSTANT.MARKER.REFX}
                                            refY={CONSTANT.MARKER.REFY}
                                            orient={CONSTANT.MARKER.ORIENT}>
                                            <path d={CONSTANT.MARKER.PATH}
                                            />
                                        </marker>
                                    </defs>
                                    <g>
                                        <rect
                                            rect x='0' y='0' width={width} height='15'
                                            rx='5' ry='5'
                                            fill={fill}
                                            style={{ borderRadius: '10px' }}
                                            onMouseOver={(event) => this.props.onMouseOver(event, node)}
                                            onDrop={(event) => this.props.onDrop(event, node)}
                                            onClick={(event) => this.nodeActive(event, node)}>
                                        </rect>
                                        <text x={textX} y="10" fontFamily="Verdana" fontSize={fontSize} fill="#fff">{node.name}</text>
                                    </g>
                                </g>)
                        })}
                    </g>
                </g>
            </svg>
        )
    }
}

export default TreeComponent2;
