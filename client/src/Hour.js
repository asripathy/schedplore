import React, { Component } from 'react';

class Hour extends Component {
    state = {
        selectedPlace: 'Cupertino',
        img: undefined
    };

    componentDidMount() {
        var url = 'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyA7LGS3VJAcsaed36ohEHYvh5K40PGLVUc&maxheight=600&photoreference=CmRaAAAASFFx6vZKmr-szryMgaAi1iGy5zJPrI_cMy8SQMmMiVM1VH2ycpt7RGFbn0b0SPVzxNuToQpYE9oGGngxIg2Rhj7mSJMb2t0sPv5U8Pkr89r8bpryHMMLWkDLOxcB5erHEhCmeg91Vh0JStqUUHa1J4SCGhR7RHh6paHawg1bRa8_9rOhkTX3PA';
        fetch(url, {
          mode: 'no-cors'
        }).then(res => console.log(res));
    }

    renderPlaces = (places) => 
    places.map((place) => (
        <tr>
            <td>
                {JSON.stringify(place)}
            </td>
        </tr>
    ));

    render() {
        return(
        <div className="hour_view">
            <style>{`
                table {
                font-family:arial, sans-serif;
                border-collapse: collapse;
                width: 100%;
                }

                td, th {
                border:1px solid #dddddd;
                text-align: left;
                padding: 8px;
                }
            `}</style>
            <table>
                {this.renderPlaces(JSON.parse(this.props.places))}
            </table>
        </div>
        )
    };

}

export default Hour;


