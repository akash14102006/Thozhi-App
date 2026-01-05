import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    ImageBackground,
    Image,
    TouchableOpacity,
    StatusBar,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Offline SOS Support',
        description: 'Now you can send SOS via SMS even when internet is unavailable',
        image: require('../assets/images/onboarding/onboarding1.jpg')
    },
    {
        id: '2',
        title: 'Squad / Family Mode',
        description: 'Stay connected with parents and loved ones through live location tracking',
        image: require('../assets/images/onboarding/onboarding2.jpg')
    },
    {
        id: '3',
        title: 'Quick SOS Triggers',
        description: 'Use phone buttons or Bluetooth devices to trigger SOS instantly',
        image: require('../assets/images/onboarding/onboarding3.jpg')
    },
    {
        id: '4',
        title: 'Nearby Police Akka Support',
        description: 'Instantly connect with nearby female police officers for help',
        image: require('../assets/images/onboarding/onboarding4.jpg')
    }
];

const Slide = ({ item }) => {
    return (
        <View style={styles.slide}>
            {}
            <Image
                source={item.image}
                style={[StyleSheet.absoluteFillObject, { width: width, height: height }]}
                resizeMode="cover"
            />

            {}
            <LinearGradient
                colors={['rgba(76, 29, 149, 0.5)', '#2e1065']}
                style={StyleSheet.absoluteFillObject}
            />

            {}
            <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        </View>
    );
};

export default function OnboardingScreen({ navigation }) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const ref = useRef();

    
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = currentSlideIndex < slides.length - 1 ? currentSlideIndex + 1 : 0;
            setCurrentSlideIndex(nextIndex);
            if (ref?.current) {
                ref.current.scrollToOffset({ offset: nextIndex * width, animated: true });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [currentSlideIndex]);

    const updateCurrentSlideIndex = (e) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        if (currentIndex !== currentSlideIndex) {
            setCurrentSlideIndex(currentIndex);
        }
    };

    const handleGetStarted = () => {
        navigation.replace('RoleSelection');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                ref={ref}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                contentContainerStyle={{ height: height }}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={slides}
                pagingEnabled
                renderItem={({ item }) => <Slide item={item} />}
                keyExtractor={(item) => item.id}
                bounces={false}
            />

            {}
            <View style={styles.footer}>
                {}
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentSlideIndex === index && styles.indicatorActive,
                            ]}
                        />
                    ))}
                </View>

                {}
                <TouchableOpacity activeOpacity={0.8} onPress={handleGetStarted}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btn}
                    >
                        <Text style={styles.btnText}>Get Started</Text>
                        <Text style={styles.arrowIcon}>{'>'}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {}
                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginLink}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2e1065',
    },
    slide: {
        width: width,
        height: height,
        justifyContent: 'flex-end',
        backgroundColor: '#2e1065',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        alignItems: 'center',
        paddingBottom: 150,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
    },
    description: {
        color: '#E5E7EB',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '80%',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: height * 0.25,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    indicator: {
        height: 8,
        width: 8,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: 5,
        borderRadius: 4,
    },
    indicatorActive: {
        backgroundColor: '#FFF',
        width: 20,
    },
    btn: {
        height: 55,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    btnText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#FFF',
        marginRight: 10,
    },
    arrowIcon: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    loginText: {
        color: '#D1D5DB',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 14,
    },
    loginLink: {
        color: '#FFF',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
