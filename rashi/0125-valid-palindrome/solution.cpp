class Solution {
public:
    bool isPalindrome(string s) {

        // Time complexity is O(n), which is optimal.
        // Space can be reduced from O(n) to O(1).

        // O(n) space approach:
        // We can remove all non-alphanumeric characters
        // and store the remaining lowercase characters in string t.
        // Then compare t from the left and right using two pointers.
        // But t stores up to n characters, so extra space is O(n).

        // O(1) space approach:
        // We don't create another string t.
        // Instead, we use two pointers directly on s.
        // l starts at the beginning and r starts at the end.

        int l = 0;
        int r = s.size() - 1;

        while (l < r) {

            // If s[l] is not alphanumeric, skip it
            // by moving l forward.
            if (!isalnum(s[l])) {
                l++;
            }

            // If s[r] is not alphanumeric, skip it
            // by moving r backward.
            else if (!isalnum(s[r])) {
                r--;
            }

            // We use else-if because we only need to
            // move one pointer at a time.
            // The next character is NOT guaranteed to be
            // alphanumeric, so we check again in the next loop.

            // If both characters are alphanumeric,
            // convert them to lowercase and compare.
            else if (tolower(s[l]) != tolower(s[r])) {
                return false; // Characters don't match
            }

            // If both characters match, move both pointers
            // toward the middle.
            else {
                l++;
                r--;
            }
        }

        // If all matching pairs are equal, it's a palindrome.
        return true;
    }
};

// Time complexity: O(n)
// Extra space complexity: O(1)