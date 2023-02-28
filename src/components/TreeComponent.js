/**
 * @author Fine
 * @description d3 and react tree component
 */
import React from 'react';
import * as d3 from 'd3';

import CONSTANT from '../utils/CONSTANT';
import { current } from 'immer';

class TreeComponent extends React.Component {
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
        const {links, nodes} = this.initTreeNodes(nextProps);
        nextState.nodes = nodes;
        nextState.links = links;

        return true;
    }

    initMapData() {
        const {width, height, data} = this.props;
        // create tree layout
        this.tree = d3.tree()
        .size([width * 0.8, height])
        .separation((a, b) => (a.parent === b.parent ? 5 : 9) / a.depth);
        const {links, nodes} = this.initTreeNodes(data);
        this.setState({links, nodes});
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
        return {nodes, links};
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
            transform={`translate(${tranInfo.x},${tranInfo.y}),scale(${tranInfo.k})`}>
            <g>
                {
                links.map((link, i) => {
                    const start = { x: link.source.x, y: link.source.y + CONSTANT.STARTBUF };
                    const end = { x: link.target.x, y: link.target.y + CONSTANT.ENDBUF };
                    const pathLink = this.bezierCurveGenerator({ source: start, target: end });

                    return <path
                        key={i}
                        d={pathLink}
                        fill='none'
                        stroke={CONSTANT.THEME.LINESTROKE}
                        strokeWidth='1'
                        strokeDasharray={CONSTANT.THEME.DASHARRAY}
                        markerEnd='url(#arrow)'/>
                    })}
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
                    let textX = 20;
                    let fontSize = 12;
                    const len = node.name.length;
                    switch(len){
                        case 5:
                            textX = 28;
                            fontSize = 12;
                            break;
                        case 16:
                            fontSize = 11;
                            textX = 5;
                            break;
                        case 22:
                            fontSize = 10;
                            textX = 0;
                            break;
                        case 24:
                            fontSize = 9;
                            textX = 0;
                            break;
                    }
                    if(node.name=='+'){
                        textX = 45;
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
                                <path d={CONSTANT.MARKER.PATH} fill={CONSTANT.MARKER.FILL} />
                            </marker>
                        </defs>
                        <g>
                            <rect
                                rect x='0' y='0' width='100' height='30'
                                rx='5' ry='5'
                                fill='#40a9ff'
                                style={{borderRadius: '60px'}}
                                onDrop={(event) => this.props.onDrop(event, node)}
                                onClick={(event) => this.nodeActive(event, node)}>
                            </rect>
                            <text x={textX} y="20" fontFamily="Verdana" fontSize={fontSize} fill="#fff">{node.name}</text>
                        </g>
                    </g>)
                })}
            </g>
            </g>
        </svg>
        )
    }
}

export default TreeComponent;
