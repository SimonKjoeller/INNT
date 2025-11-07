

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import filterModalStyles from '../styles/filterModalStyles';

const FilterModal = ({ visible, onClose }) => {
  const [gameReleaseOptions, setGameReleaseOptions] = React.useState(false);
  const [selectedRelease, setSelectedRelease] = React.useState(null);
  const [genreOptions, setGenreOptions] = React.useState(false);
  const [selectedGenre, setSelectedGenre] = React.useState(null);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={{ marginTop: 0, marginBottom: 0, marginHorizontal: 0, justifyContent: 'flex-start', backgroundColor: 'transparent' }}
    >
      <View style={[filterModalStyles.fullScreenContainer, { marginTop: 100, height: '85%' }]}> 
        <View style={filterModalStyles.headerRow}>
          <Text onPress={onClose} style={filterModalStyles.cancelText}>Cancel</Text>
          <Text style={filterModalStyles.filtersText}>Filters</Text>
          <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={filterModalStyles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
  <TouchableOpacity style={filterModalStyles.button} onPress={() => setGameReleaseOptions(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <Text style={[filterModalStyles.buttonText, { textAlign: 'left', flex: 1 }]}>Release Date</Text>
            {selectedRelease && (
              <Text style={[filterModalStyles.buttonText, { color: '#6C5CE7', marginLeft: 8 }]}>{selectedRelease}</Text>
            )}
          </View>
        </TouchableOpacity>
        {gameReleaseOptions && (
          <View style={{ position: 'absolute', top: 56, left: 0, right: 0, backgroundColor: '#2d2d30', borderRadius: 12, padding: 16, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <Text style={[filterModalStyles.title, { marginBottom: 12 }]}>Sort by Release Date</Text>
            <TouchableOpacity style={filterModalStyles.button} onPress={() => { setSelectedRelease('Newest'); setGameReleaseOptions(false); }}>
              <Text style={[filterModalStyles.buttonText, { textAlign: 'left', width: '100%' }]}>Newest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={filterModalStyles.button} onPress={() => { setSelectedRelease('Oldest'); setGameReleaseOptions(false); }}>
              <Text style={[filterModalStyles.buttonText, { textAlign: 'left', width: '100%' }]}>Oldest</Text>
            </TouchableOpacity>
          </View>
        )}
  <TouchableOpacity style={filterModalStyles.button} onPress={() => setGenreOptions(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <Text style={[filterModalStyles.buttonText, { textAlign: 'left', flex: 1 }]}>Genre</Text>
            {selectedGenre && (
              <Text style={[filterModalStyles.buttonText, { color: '#6C5CE7', marginLeft: 8 }]}>{selectedGenre}</Text>
            )}
          </View>
        </TouchableOpacity>
        {genreOptions && (
          <View style={{ position: 'absolute', top: 56, left: 0, right: 0, backgroundColor: '#2d2d30', borderRadius: 12, padding: 16, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <Text style={[filterModalStyles.title, { marginBottom: 12 }]}>Sort by Genre</Text>
            <TouchableOpacity style={filterModalStyles.button} onPress={() => { setSelectedGenre('Shooter'); setGenreOptions(false); }}>
              <Text style={[filterModalStyles.buttonText, { textAlign: 'left', width: '100%' }]}>Shooter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={filterModalStyles.button} onPress={() => { setSelectedGenre('Adventure'); setGenreOptions(false); }}>
              <Text style={[filterModalStyles.buttonText, { textAlign: 'left', width: '100%' }]}>Adventure</Text>
            </TouchableOpacity>
            <TouchableOpacity style={filterModalStyles.button} onPress={() => { setSelectedGenre('MMO'); setGenreOptions(false); }}>
              <Text style={[filterModalStyles.buttonText, { textAlign: 'left', width: '100%' }]}>MMO</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default FilterModal;
