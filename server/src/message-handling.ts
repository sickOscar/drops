export function messageHasStartingCharacter(incomingMessage: string[]) {
    return incomingMessage[0].startsWith("*");
}

export function messageHasEndingCharacter(incomingMessage: string[]) {
    return incomingMessage[incomingMessage.length - 1].endsWith("|");
}


export function restoreTruncatedMessage(incomingMessage: string[], lastRemainingToken: string): string {
    if (incomingMessage[0] && !messageHasStartingCharacter(incomingMessage)) {
        incomingMessage[0] = lastRemainingToken + incomingMessage[0];
        lastRemainingToken = "";
    }

    if (incomingMessage[incomingMessage.length - 1] && !messageHasEndingCharacter(incomingMessage)) {
        lastRemainingToken = incomingMessage[incomingMessage.length - 1];
        incomingMessage.pop();
    }

    return lastRemainingToken;
}