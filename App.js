import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import Button from './src/components/Button';

export default function App() {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, []);

    const getLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            let locationData = await Location.getCurrentPositionAsync({});
            console.log(locationData);
            setLocation(locationData.coords);
        } catch (error) {
            console.error(error);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const data = await cameraRef.current.takePictureAsync();
                console.log(data);
                setImage(data.uri);
                await getLocation();
            } catch (e) {
                console.log(e);
            }
        }
    };

    const saveImage = async () => {
        if (image) {
            try {
                await MediaLibrary.createAssetAsync(image);
                alert('Picture saved!');
                setImage(null);
                setLocation(null);
            } catch (e) {
                console.log(e);
            }
        }
    };

    if (hasCameraPermission === null) {
        return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            {!image ? (
                <Camera
                    style={styles.camera}
                    type={type}
                    flashMode={flash}
                    ref={cameraRef}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 30 }}>
                        <Button icon={'retweet'} onPress={() => {
                            setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);
                        }} />
                        <Button icon={'flash'}
                            color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#f1f1f1'}
                            onPress={() => {
                                setFlash(flash === Camera.Constants.FlashMode.off
                                    ? Camera.Constants.FlashMode.on
                                    : Camera.Constants.FlashMode.off
                                );
                            }} />
                    </View>
                </Camera>
            ) : (
                <Image source={{ uri: image }} style={styles.camera} />
            )}
            <View>
                {image ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 50 }}>
                        <Button title={"Re-take"} icon="retweet" onPress={() => setImage(null)} />
                        <Button title={"Save"} icon="check" onPress={saveImage} />
                    </View>
                ) : (
                    <Button title={'Take a picture'} icon="camera" onPress={takePicture} />
                )}
            </View>
            {location && (
                <Text style={{ color: '#fff', padding: 10 }}>
                    Localização: {location.latitude}, {location.longitude}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        paddingBottom: 20
    },
    camera: {
        flex: 1,
        borderRadius: 20,
    }
});
