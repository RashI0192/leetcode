
class Solution {
public:
    string convertToTitle(int columnNumber) {
        // we can work backwards
        string ans;
        int n = columnNumber; // n is the remaining number quotent
        while (n != 0) {
            n--; // adjust because Excel columns start from 1, not 0
            int rem = n % 26; // get the last letter (0 = A, 25 = Z)
            ans.push_back('A' + rem); // convert remainder into a letter
            n = n / 26; // move to the preceding letters
        }
        reverse(ans.begin(), ans.end()); // reverse because we built it backwards
        return ans;
    }
};

// single - 1-26 :char-a +1 
// AA - 2 digit first is A that means (1*26 ) + second letter A
// so its like a chain rule?
// 701 : (26*26)+Y
// AAB = (1*26*26)+2 - so num of 26 = size-1
//A- 26
//ZZ - (26*26 + 26)
//zzz- (26*26*26 + 26*26 +26) - so ranges 

