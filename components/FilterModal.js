

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import filterModalStyles from '../styles/filterModalStyles';


const FilterModal = ({ visible, onClose, onApply, initialRelease, initialGenre }) => {
  const [gameReleaseOptions, setGameReleaseOptions] = React.useState(false);
  const [selectedRelease, setSelectedRelease] = React.useState(initialRelease || null);
  const [genreOptions, setGenreOptions] = React.useState(false);
  const [selectedGenre, setSelectedGenre] = React.useState(initialGenre || null);

  // Update state if initial values change (when modal is reopened)
  React.useEffect(() => {
    setSelectedRelease(initialRelease || null);
    setSelectedGenre(initialGenre || null);
  }, [initialRelease, initialGenre, visible]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={filterModalStyles.modalStyle}
    >
      <View style={[filterModalStyles.fullScreenContainer, filterModalStyles.fullScreenContainerOverride]}> 
        <View style={filterModalStyles.headerRow}>
          <Text onPress={onClose} style={filterModalStyles.cancelText}>Cancel</Text>
          <Text style={filterModalStyles.filtersText}>Filters</Text>
          <TouchableOpacity
            onPress={() => {
              if (onApply) onApply({ release: selectedRelease, genre: selectedGenre });
              onClose();
            }}
            style={filterModalStyles.doneButtonOverride}
          >
            <Text style={filterModalStyles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={filterModalStyles.button} onPress={() => setGameReleaseOptions(true)}>
          <View style={filterModalStyles.rowFullWidth}>
            <Text style={[filterModalStyles.buttonText, filterModalStyles.leftFlex]}>Release Date</Text>
            {selectedRelease && (
              <Text style={[filterModalStyles.buttonText, filterModalStyles.selectedRelease]}>{selectedRelease}</Text>
            )}
          </View>
        </TouchableOpacity>
        {gameReleaseOptions && (
          <>
            <TouchableOpacity style={filterModalStyles.dropdownOverlay} activeOpacity={1} onPress={() => setGameReleaseOptions(false)} />
            <View style={filterModalStyles.absoluteDropdown}>
              <Text style={[filterModalStyles.filtersText, filterModalStyles.marginBottom12]}>Sort by Release Date</Text>
              <TouchableOpacity style={filterModalStyles.button} onPress={() => {
                if (selectedRelease === 'Newest') {
                  setSelectedRelease(null);
                } else {
                  setSelectedRelease('Newest');
                }
                setGameReleaseOptions(false);
              }}>
                <View style={filterModalStyles.rowFullWidth}>
                  <Text style={[filterModalStyles.buttonText, filterModalStyles.leftFlex]}>Newest</Text>
                  {selectedRelease === 'Newest' && (
                    <Ionicons name="checkmark" size={22} color="#6C5CE7" style={filterModalStyles.purpleCheck} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={filterModalStyles.button} onPress={() => {
                if (selectedRelease === 'Oldest') {
                  setSelectedRelease(null);
                } else {
                  setSelectedRelease('Oldest');
                }
                setGameReleaseOptions(false);
              }}>
                <View style={filterModalStyles.rowFullWidth}>
                  <Text style={[filterModalStyles.buttonText, filterModalStyles.leftFlex]}>Oldest</Text>
                  {selectedRelease === 'Oldest' && (
                    <Ionicons name="checkmark" size={22} color="#6C5CE7" style={filterModalStyles.purpleCheck} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
        <TouchableOpacity style={filterModalStyles.button} onPress={() => setGenreOptions(true)}>
          <View style={filterModalStyles.rowFullWidth}>
            <Text style={[filterModalStyles.buttonText, filterModalStyles.leftFlex]}>Genre</Text>
            {selectedGenre && (
              <Text style={[filterModalStyles.buttonText, filterModalStyles.selectedRelease]}>{selectedGenre}</Text>
            )}
          </View>
        </TouchableOpacity>
          {/* Removed contextual Remove Filter under Genre */}
        {genreOptions && (
          <>
            <TouchableOpacity style={filterModalStyles.dropdownOverlay} activeOpacity={1} onPress={() => setGenreOptions(false)} />
            <View style={filterModalStyles.absoluteDropdown}>
              <Text style={[filterModalStyles.filtersText, filterModalStyles.marginBottom12]}>Sort by Genre</Text>
              <TouchableOpacity style={filterModalStyles.button} onPress={() => {
                if (selectedGenre === 'Shooter') {
                  setSelectedGenre(null);
                } else {
                  setSelectedGenre('Shooter');
                }
                setGenreOptions(false);
              }}>
                <View style={filterModalStyles.rowFullWidth}>
                  <Text style={[filterModalStyles.buttonText, filterModalStyles.leftFlex]}>Shooter</Text>
                  {selectedGenre === 'Shooter' && (
                    <Ionicons name="checkmark" size={22} color="#6C5CE7" style={filterModalStyles.purpleCheck} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={filterModalStyles.button} onPress={() => {
                if (selectedGenre === 'Adventure') {
                  setSelectedGenre(null);
                } else {
                  setSelectedGenre('Adventure');
                }
                setGenreOptions(false);
              }}>
                <View style={filterModalStyles.rowFullWidth}>
                  <Text style={[filterModalStyles.buttonText, filterModalStyles.leftFlex]}>Adventure</Text>
                  {selectedGenre === 'Adventure' && (
                    <Ionicons name="checkmark" size={22} color="#6C5CE7" style={filterModalStyles.purpleCheck} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={filterModalStyles.button} onPress={() => {
                if (selectedGenre === 'Racing') {
                  setSelectedGenre(null);
                } else {
                  setSelectedGenre('Racing');
                }
                setGenreOptions(false);
              }}>
                <View style={filterModalStyles.rowFullWidth}>
                  <Text style={[filterModalStyles.buttonText, filterModalStyles.leftFlex]}>Racing</Text>
                  {selectedGenre === 'Racing' && (
                    <Ionicons name="checkmark" size={22} color="#6C5CE7" style={filterModalStyles.purpleCheck} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
        {/* Always show Remove Filter at base, greyed out if nothing to clear */}
        {(!genreOptions && !gameReleaseOptions) && (
          <TouchableOpacity
            style={filterModalStyles.removeFilterButton}
            onPress={() => {
              if (selectedRelease || selectedGenre) {
                setSelectedRelease(null);
                setSelectedGenre(null);
                if (onApply) onApply({ release: null, genre: null });
                if (onClose) onClose();
              }
            }}
            disabled={!selectedRelease && !selectedGenre}
          >
            <Text style={selectedRelease || selectedGenre ? filterModalStyles.removeFilterText : [filterModalStyles.removeFilterText, { color: '#888' }]}>Remove Filter</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

export default FilterModal;
