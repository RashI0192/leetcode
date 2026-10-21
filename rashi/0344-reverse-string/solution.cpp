class Solution {
public:
    void reverseString(vector<char>& s) {
        if (s.size()==1){
            return;
        }
        int l=0;
        int r=s.size()-1;
        while (l<r){
            char temp=s[r];
            s[r]=s[l];
            s[l]=temp;
            l++;
            r--;
        }
        return;
        
        
    }
};