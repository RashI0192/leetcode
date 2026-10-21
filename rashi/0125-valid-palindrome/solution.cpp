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
};