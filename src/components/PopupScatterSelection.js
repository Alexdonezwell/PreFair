import React from 'react';
import $ from "jquery";
import Popup from 'reactjs-popup';
import './PopupScatterSelection.css'
import { QuestionCircleOutlined} from '@ant-design/icons';
import ReactTooltip from 'react-tooltip';
// import { number } from 'echarts';

class PopupScatterSelection extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { mainAppDelegate, clusterRate } = this.props;
        const typeRef = React.createRef();

        const numbers = Object.keys(clusterRate).flatMap(k => Object.keys(clusterRate[k]).map(l => clusterRate[k][l]))
        const maxNum = Math.max(...numbers), minNum = Math.min(...numbers)
        const normalNumbers = numbers.map(x => (x - minNum) / (maxNum - minNum))
        let normalNumberMap = {}
        for (let i = 0; i < numbers.length; i++) {
            normalNumberMap[numbers[i]] = normalNumbers[i];
        }

        return (
            <div>
                <select name="projectionTypes" id="projectionTypes" ref={typeRef} onChange={(e)=>{
                    mainAppDelegate.projectScatter(e.target.value);
                }}>
                    <option value="pca">PCA</option>
                    <option value="mds">MDS</option>
                    <option value="tsne">TSNE</option>
                </select>
                <Popup
                    trigger={<button className="button"> Select Clusters </button>}
                    modal
                    nested
                >
                    {close => (
                        <div className="modal">
                            <button className="close" onClick={close}>
                                &times;
                            </button>
                            <div className="header"> Cluster Selection <QuestionCircleOutlined data-tip='信息填写在这里' /> </div>
                            <ReactTooltip />
                            <div className="content">
                                <table>
                                    <tr>
                                        <td>  </td>
                                        <td> 2 </td>
                                        <td> 3 </td>
                                        <td> 4 </td>
                                        <td> 5 </td>
                                        <td> 6 </td>
                                    </tr>
                                    <tr>
                                        <td> K-Means </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["kmeans"] != null ? normalNumberMap[clusterRate["kmeans"][2]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(2, "kmeans");
                                                close();
                                            }}>
                                            {clusterRate["kmeans"] != null ? clusterRate["kmeans"][2].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["kmeans"] != null ? normalNumberMap[clusterRate["kmeans"][3]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(3, "kmeans");
                                                close();
                                            }}>
                                            {clusterRate["kmeans"] != null ? clusterRate["kmeans"][3].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["kmeans"] != null ? normalNumberMap[clusterRate["kmeans"][4]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(4, "kmeans");
                                                close();
                                            }}>
                                            {clusterRate["kmeans"] != null ? clusterRate["kmeans"][4].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["kmeans"] != null ? normalNumberMap[clusterRate["kmeans"][5]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(5, "kmeans");
                                                close();
                                            }}>
                                            {clusterRate["kmeans"] != null ? clusterRate["kmeans"][5].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["kmeans"] != null ? normalNumberMap[clusterRate["kmeans"][6]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(6, "kmeans");
                                                close();
                                            }}>
                                            {clusterRate["kmeans"] != null ? clusterRate["kmeans"][6].toFixed(2) : "NaN"}
                                        </button> </td>
                                    </tr>
                                    <tr>
                                        <td> HAC </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["hac"] != null ? normalNumberMap[clusterRate["hac"][2]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(2, "hac");
                                                close();
                                            }}>
                                            {clusterRate["hac"] != null ? clusterRate["hac"][2].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["hac"] != null ? normalNumberMap[clusterRate["hac"][3]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(3, "hac");
                                                close();
                                            }}>
                                            {clusterRate["hac"] != null ? clusterRate["hac"][3].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["hac"] != null ? normalNumberMap[clusterRate["hac"][4]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(4, "hac");
                                                close();
                                            }}>
                                            {clusterRate["hac"] != null ? clusterRate["hac"][4].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["hac"] != null ? normalNumberMap[clusterRate["hac"][5]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(5, "hac");
                                                close();
                                            }}>
                                            {clusterRate["hac"] != null ? clusterRate["hac"][5].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["hac"] != null ? normalNumberMap[clusterRate["hac"][6]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(6, "hac");
                                                close();
                                            }}>
                                            {clusterRate["hac"] != null ? clusterRate["hac"][6].toFixed(2) : "NaN"}
                                        </button> </td>
                                    </tr>
                                    <tr>
                                        <td> DBSCAN </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["dbscan"] != null ? normalNumberMap[clusterRate["dbscan"][2]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(2);
                                                close();
                                            }}>
                                            {clusterRate["dbscan"] != null ? clusterRate["dbscan"][2].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["dbscan"] != null ? normalNumberMap[clusterRate["dbscan"][3]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(3);
                                                close();
                                            }}>
                                            {clusterRate["dbscan"] != null ? clusterRate["dbscan"][3].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["dbscan"] != null ? normalNumberMap[clusterRate["dbscan"][4]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(4);
                                                close();
                                            }}>
                                            {clusterRate["dbscan"] != null ? clusterRate["dbscan"][4].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["dbscan"] != null ? normalNumberMap[clusterRate["dbscan"][5]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(5);
                                                close();
                                            }}>
                                            {clusterRate["dbscan"] != null ? clusterRate["dbscan"][5].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["dbscan"] != null ? normalNumberMap[clusterRate["dbscan"][6]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(6);
                                                close();
                                            }}>
                                            {clusterRate["dbscan"] != null ? clusterRate["dbscan"][6].toFixed(2) : "NaN"}
                                        </button> </td>
                                    </tr>
                                    <tr>
                                        <td> OPTICS </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["optics"] != null ? normalNumberMap[clusterRate["optics"][2]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(2);
                                                close();
                                            }}>
                                            {clusterRate["optics"] != null ? clusterRate["optics"][2].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["optics"] != null ? normalNumberMap[clusterRate["optics"][3]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(3);
                                                close();
                                            }}>
                                            {clusterRate["optics"] != null ? clusterRate["optics"][3].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["optics"] != null ? normalNumberMap[clusterRate["optics"][4]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(4);
                                                close();
                                            }}>
                                            {clusterRate["optics"] != null ? clusterRate["optics"][4].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["optics"] != null ? normalNumberMap[clusterRate["optics"][5]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(5);
                                                close();
                                            }}>
                                            {clusterRate["optics"] != null ? clusterRate["optics"][5].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["optics"] != null ? normalNumberMap[clusterRate["optics"][6]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(6);
                                                close();
                                            }}>
                                            {clusterRate["optics"] != null ? clusterRate["optics"][6].toFixed(2) : "NaN"}
                                        </button> </td>
                                    </tr>
                                    <tr>
                                        <td> BIRCH </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["birch"] != null ? normalNumberMap[clusterRate["birch"][2]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(2);
                                                close();
                                            }}>
                                            {clusterRate["birch"] != null ? clusterRate["birch"][2].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["birch"] != null ? normalNumberMap[clusterRate["birch"][3]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(3);
                                                close();
                                            }}>
                                            {clusterRate["birch"] != null ? clusterRate["birch"][3].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["birch"] != null ? normalNumberMap[clusterRate["birch"][4]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(4);
                                                close();
                                            }}>
                                            {clusterRate["birch"] != null ? clusterRate["birch"][4].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["birch"] != null ? normalNumberMap[clusterRate["birch"][5]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(5);
                                                close();
                                            }}>
                                            {clusterRate["birch"] != null ? clusterRate["birch"][5].toFixed(2) : "NaN"}
                                        </button> </td>
                                        <td> <button className='close'
                                            style={{
                                                backgroundColor: 'rgb(0, 0, ' + (clusterRate["birch"] != null ? normalNumberMap[clusterRate["birch"][2]] : 0) * 255 + ')'
                                            }}
                                            onClick={() => {
                                                mainAppDelegate.projectScatter(typeRef.current.value);
                                                mainAppDelegate.getclusterResults(6);
                                                close();
                                            }}>
                                            {clusterRate["birch"] != null ? clusterRate["birch"][6].toFixed(2) : "NaN"}
                                        </button> </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    )
                    }
                </Popup>
            </div >
        );
    }
}

export default PopupScatterSelection;