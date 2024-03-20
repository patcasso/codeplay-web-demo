export const getIconName = (instNum) => {
    switch (true) {
        case (instNum === -1):
            return "drums";
        case (instNum >= 0 && instNum <= 7):
            return "piano";
        case (instNum >= 8 && instNum <= 15):
            return "chromatic_perc";
        case (instNum >= 16 && instNum <= 23):
            return "organ";
        case (instNum >= 24 && instNum <= 31):
            return "guitar";
        case (instNum >= 32 && instNum <= 39):
            return "bass";
        case (instNum >= 40 && instNum <= 49):
            return "string";
        case (instNum >= 50 && instNum <= 51):
            return "synth";
        case (instNum >= 52 && instNum <= 54):
            return "choir";
        case (instNum === 55): // Orchestra Hit
            return "synth"; 
        case (instNum >= 56 && instNum <= 63):
            return "brass"; 
        case (instNum >= 64 && instNum <= 71):
            return "reed"; 
        default:
            return "piano";
    }
}