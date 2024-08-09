
export function blockForThreeSeconds() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000);
    });
}
