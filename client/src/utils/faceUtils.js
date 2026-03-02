// Calculates the Euclidean distance between two face descriptors
// face-api.js descriptors are Float32Array of length 128
export function euclideanDistance(desc1, desc2) {
    if (!desc1 || !desc2 || desc1.length !== desc2.length) {
        return Infinity;
    }
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        const diff = desc1[i] - desc2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

// Finds the best matched user given a descriptor and a list of users
export function findBestMatch(users, targetDescriptor, maxDistance = 0.6) {
    let bestMatch = null;
    let smallestDistance = Infinity;

    for (const user of users) {
        if (!user.faceDescriptor) continue;

        const distance = euclideanDistance(user.faceDescriptor, targetDescriptor);
        if (distance < smallestDistance) {
            smallestDistance = distance;
            bestMatch = user;
        }
    }

    if (smallestDistance < maxDistance) {
        return { user: bestMatch, distance: smallestDistance };
    }
    return null;
}
