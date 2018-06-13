import React, { Component } from 'react';

class List extends Component {

    renderPlace = (place) => 
        (<div> {place} </div>);

    renderPlaces = () => 
        this.props.places.map((place) => (
            <div>
                {this.renderPlace(place)}
            </div>
        ));

    render() {
        return(
            <div className="test">
                {this.renderPlaces()}
            </div>
        )
    };

}

export default List;
