function numberArrayToHex(input: number[]) {
    var result = "0x"
    for (var byteCode of input) {
        result += numberToHex(byteCode);
    }

    return result;
}

function numberToHex(input: number) {
    const byteHex = input.toString(16)

    if (byteHex.length == 2) {
        return byteHex;
    }
    else if (byteHex.length == 1) {
        return ("0" + byteHex)
    }
}

export{
    numberArrayToHex
}