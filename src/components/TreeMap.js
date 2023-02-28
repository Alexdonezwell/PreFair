/**
 * @author Fine
 * @description tree map
 */
import React from 'react';
import * as d3 from 'd3';
import { FullscreenExitOutlined, PlusCircleOutlined, MinusCircleOutlined, FullscreenOutlined, DatabaseOutlined, DeleteRowOutlined, AlignCenterOutlined, WarningOutlined } from '@ant-design/icons';
import CONSTANT from '../utils/CONSTANT';
import TreeComponent from './TreeComponent';

class TreeMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentNode: {}, // select node
            menuStatus: 'hidden',
            positionY: 0,
            positionX: 0,
            tranInfo: CONSTANT.TRANINFO,
            isFullScreen: false,
            dataSource: null,
            maxId: 2
        }

        this.onDrop = this.onDrop.bind(this);
    }

    deepTraversal = (node, name, id) => {
        var nodes = [];
        if (node != null) {
            if (node.id == id) {
                node.name = name;
            }
            nodes.push(node);
            if (node.children) {
                let children = node.children;
                for (let i = 0; i < children.length; i++) {
                    this.deepTraversal(children[i], name, id);
                }
            }
        }
        return nodes;
    }

    getNewData = (source, name, id) => {
        let nodes = this.deepTraversal(source, name, id);
        return nodes;
    }

    onDrop = (event, cur) => {
        let id = cur.id;
        let name = event.dataTransfer.getData("name");
        let dataSource = this.getNewData(this.state.dataSource, name, id);
        this.setState({ dataSource: dataSource[0] });
    }

    componentDidMount() {
        this.watchFullScreen();
        this.props.data.id = 1;
        this.setState({ dataSource: this.props.data });
    }

    addNode = () => {
        const { currentNode } = this.state;
        let maxId = this.state.maxId;
        this.cancleActive();
        if (!currentNode.children) {
            currentNode.children = [];
        }
        CONSTANT.NEWNODE.name = '+';//default value
        CONSTANT.NEWNODE.id = maxId++;
        currentNode.children.push(CONSTANT.NEWNODE);

        let rootNode = currentNode;
        while (rootNode.parent) {
            rootNode = rootNode.parent;
        }
        delete rootNode.data;
        this.setState({ dataSource: rootNode, maxId: maxId++ });
    }

    generate = () => {
        let { currentNode } = this.state;
        this.props.generate(currentNode);
    }

    deleteNode = () => {
        let { currentNode } = this.state;
        this.cancleActive();
        if (currentNode.children) {
            currentNode.children = null;
        }
        const currentNodeName = currentNode.name;
        const currentNodeParent = currentNode.parent;
        if (currentNodeParent) {
            for (let i = 0; i < currentNodeParent.children.length; i++) {
                if (currentNodeParent.children[i].name === currentNodeName) {
                    currentNodeParent.children.splice(i, 1);
                }
            }
        } else {
            currentNode = null;
        }
        let rootNode = currentNode;
        if (rootNode) {
            while (rootNode.parent) {
                rootNode = rootNode.parent;
            }
        }
        this.setState({ dataSource: rootNode });
    }

    cancleActive = () => {
        // reset node active
        this.setState({ menuStatus: 'hidden', currentNode: {} });
    }

    nodeClick = (event, currentNode) => {
        // const positionX = event.pageX + CONSTANT.DIFF.X + 'px';
        // const positionY = event.pageY + CONSTANT.DIFF.Y  + 'px';
        const positionX = (event.pageX) + 'px';
        const positionY = (event.pageY) + 'px';
        event.stopPropagation();
        this.setState({ menuStatus: 'visible', currentNode, positionX, positionY });
    }

    zoomIn = () => {
        const g = d3.select('.tree_map');
        d3.zoom().scaleBy(g, 0.9);
        const tranInfo = d3.zoomTransform(g.node());
        this.setState({ tranInfo });
    }

    zoomOut = () => {
        const g = d3.select('.tree_map');
        d3.zoom().scaleBy(g, 1.1);
        const tranInfo = d3.zoomTransform(g.node());
        this.setState({ tranInfo });
    }

    viewFullPage = () => {
        if (this.state.isFullScreen) {
            this.exitFullscreen();
        } else {
            this.requestFullScreen();
        }
    }

    requestFullScreen() {
        const de = document.documentElement;
        if (de.requestFullscreen) {
            de.requestFullscreen();
        } else if (de.mozRequestFullScreen) {
            de.mozRequestFullScreen();
        } else if (de.webkitRequestFullScreen) {
            de.webkitRequestFullScreen();
        }
    }

    // exit full screen
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }

    watchFullScreen() {
        document.addEventListener(
            "fullscreenchange",
            () => {
                this.setState({
                    isFullScreen: document.fullscreen
                });
            },
            false
        );
        document.addEventListener(
            "mozfullscreenchange",
            () => {
                this.setState({
                    isFullScreen: document.mozFullScreen
                });
            },
            false
        );
        document.addEventListener(
            "webkitfullscreenchange",
            () => {
                this.setState({
                    isFullScreen: document.webkitIsFullScreen
                });
            },
            false
        );
    }

    render() {
        const {
            currentNode, positionX, positionY,
            menuStatus, tranInfo, isFullScreen, dataSource
        } = this.state;
        return (
            <div onClick={this.cancleActive}>
                <TreeComponent {...this.props} tranInfo={tranInfo} onDrop={this.onDrop} nodeClick={this.nodeClick} dataSource={dataSource} currentNode={currentNode} />
                <div className="menu" style={{ visibility: menuStatus, left: positionX, top: positionY }}>
                    <div className="add-menu">
                        <ul>
                            <li onClick={this.addNode}><DatabaseOutlined />Create Node</li>
                            <li onClick={this.deleteNode}><DeleteRowOutlined />Delete Node</li>
                            <li onClick={this.generate}><DeleteRowOutlined />Generate</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

export default TreeMap;
