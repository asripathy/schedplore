import React, { Component } from 'react';

class Hour extends Component {
    state = {
        selectedPlace: 'Cupertino',
    };

    renderSelectedPlace = () => {
        if (this.state.selectedPlace === '') {
            return null;
        } else {
            return <p> {this.state.selectedPlace} </p>
        }
    }

    render() {
        return(
            <div>
                {this.renderSelectedPlace()}
            </div>
        )
    };

}

export default Hour;


