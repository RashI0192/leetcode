class Solution {
public:
    bool isPalindrome(string s) {
        string t="";
        for (int i=0; i<s.size();i++){
            if (isalnum(s[i])){//question says alpha numeric not just leets
                t.push_back(tolower(s[i]));
            }
        }
        if (t==""){
            return true;
        }
        int l=0;
        int r=t.size()-1;
        while (l<r){
            if (t[l]!=t[r]){
                return false;
            }
            l++;
            r--;
        }
        return true;
        
    }
};// IMP READ AS ABOVE CODE NOT OPTIMAL 
// Time complexity is O(n), which is optimal.
// Space complexity can be reduced from O(n) to O(1).
// O(n) space approach:
// First, remove all non-alphanumeric characters and convert the remaining
// characters to lowercase, storing them in a new string t.
// Then use two pointers, l and r, to compare t from the left and right.
// Since we store the cleaned characters in t, the extra space is O(n).

// To reduce the extra space to O(1), we don't create another string t.

// Instead, use two pointers directly on the original string s.

// l starts at the beginning, and r starts at the end.

// While l < r, check whether s[l] is alphanumeric.
// If not, move l forward using l++.

// Similarly, if s[r] is not alphanumeric, move r backward using r--.

// The next character is NOT guaranteed to be alphanumeric,
// so the while loop checks again before comparing.

// If both characters are alphanumeric, convert them to lowercase
// and compare them. If they are different, return false.

// If they match, move both pointers toward the middle.

// If the pointers meet or cross without finding a mismatch,
// return true because the string is a palindrome.
//class Solution {
//public:
    //bool isPalindrome(string s) {
        //int l = 0, r = s.size() - 1;
        //while(l <= r){
            //while(l < r && !isalnum(s[l])) l++;
            //while(l < r && !isalnum(s[r])) r--;
           // if(tolower(s[l]) != tolower(s[r])) return false;
            //l++;
            //r--;
        //}
        //return true;
    //}
//};