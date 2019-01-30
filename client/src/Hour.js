import React, { Component } from 'react';

class Hour extends Component {
    state = {
        selectedPlace: 'Cupertino',
        img: undefined
    };

    renderPlaces = (places) => 
    places.map((place) => (
        <tr>
            <td>
                <img class="tile-img" src = {place.photo} height="70"/>
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


