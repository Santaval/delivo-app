import { initialsOf, interpolatePosition, type Position } from '@/utils/driverLocation';
import MapboxGL from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type DriverMarkerData = {
  coordinate: { latitude: number; longitude: number };
  /** Degrees clockwise from north; `null` when unknown (no arrow). */
  heading: number | null;
  /** Used for the initials. */
  name?: string | null;
};

const ANIMATION_MS = 1_000;
const SIZE = 44;

/** Moves smoothly towards `target` (positions arrive every ~10 s). */
const useAnimatedPosition = (target: Position): Position => {
  const [current, setCurrent] = useState<Position>(target);
  const currentRef = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const from = currentRef.current;
    const start = Date.now();
    const step = () => {
      const t = (Date.now() - start) / ANIMATION_MS;
      const next = interpolatePosition(from, target, t);
      currentRef.current = next;
      setCurrent(next);
      frame.current = t < 1 ? requestAnimationFrame(step) : null;
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target.lat, target.lng, target.heading]); // eslint-disable-line react-hooks/exhaustive-deps

  return current;
};

/** Driver position: initials in a circle, with an arrow rotated by `heading`. */
export default function DriverMarker({ coordinate, heading, name }: DriverMarkerData) {
  const position = useAnimatedPosition({
    lat: coordinate.latitude,
    lng: coordinate.longitude,
    heading,
  });

  return (
    <MapboxGL.MarkerView
      id="driver-live-location"
      coordinate={[position.lng, position.lat]}
      allowOverlap
    >
      <View style={styles.container} pointerEvents="none">
        {position.heading !== null && (
          <View style={[styles.arrowWrapper, { transform: [{ rotate: `${position.heading}deg` }] }]}>
            <View style={styles.arrow} />
          </View>
        )}
        <View style={styles.circle}>
          <Text style={styles.initials}>{initialsOf(name)}</Text>
        </View>
      </View>
    </MapboxGL.MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowWrapper: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2563eb',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  initials: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
