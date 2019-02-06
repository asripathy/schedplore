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
                <div>
                    <img class="tile-img" src = {place.photo} height="70"/>
                </div>
                {/* {JSON.stringify(place).substring(100)} */}
                <div>
                    {place.name}<br/>
                    {place.address}<br/>
                    {place.rating}
                </div>
            </td>
        </tr>
    ));

    render() {
        return(
        <div class="hour-view">
            <table class="place-list-table">
                {this.renderPlaces(JSON.parse(this.props.places))}
            </table>
        </div>
        )
    };

}

export default Hour;


