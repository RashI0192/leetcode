class Solution {
public:
    string gcdOfStrings(string str1, string str2) {
        if (str1 + str2 != str2 + str1) {
            return "";
        }
        int a = str1.size(); // a = 6
        int b = str2.size(); // b = 4
        while (b != 0) {//gcd(a,b) = gcd(b, a%b) so a get prev b and b is a%b while loop
            int temp = b; 
            b = a % b;   
            a = temp;   
        }
        return str1.substr(0, a);
    }
};


// - First, we check if str1 + str2 == str2 + str1.
// as since if str1 and str2 have unequal lengths, we concatenate them in both orders and compare them.
// - If both are equal, it means both strings follow the same repeating pattern.
// - Example: "ABABAB" + "ABAB" = "ABABABABAB".
// - "ABAB" + "ABABAB" = "ABABABABAB", so they are equal.
// - But "LEET" + "CODE" = "LEETCODE", while "CODE" + "LEET" = "CODELEET", so they are not equal.
// - If they are not equal, return "" because no common repeating string exists.
// - Next, we get the lengths of both strings.
// - Example: str1 has length 6 and str2 has length 4.
// - Then, we use the Euclidean algorithm to find the GCD of both string lengths.
// - We use a while loop that continues as long as b != 0.
// - In each iteration, we calculate a % b, which gives the remainder.
// - We update a = b and b = a % b using the old value of a.
// - We repeat this until b becomes 0.
// - When b becomes 0, a contains the GCD.
// - Example: GCD(6, 4) -> GCD(4, 2) -> GCD(2, 0).
// - Therefore, the GCD is 2.
// - Finally, we use str1.substr(0, a) to get the answer.
// - The substr() function takes the starting index and the length.
// - Example: str1.substr(0, 2) takes 2 characters starting from index 0.
// - If str1 = "ABABAB", the result is "AB".
