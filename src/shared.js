export function calculateCurrentProbability(increaseDate) {
    // Your logic for calculating the current probability (p) based on the increase date
    // For demonstration purposes, we'll use a simple calculation
    const daysSinceIncrease = Math.ceil((new Date() - new Date(increaseDate)) / (1000 * 3600 * 24));
    return (daysSinceIncrease * 0.01) + 0.01; 
}