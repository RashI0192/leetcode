class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int k = 0;

        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] != val) {//3
                nums[k] = nums[i];//013
                k++;//k=3
            }
        }

        return k;
    }
};
// trick to such questions where we need to remove element and move elements 
//in front is to use a variable k =0 so we push to starting
// and keep track of K so any non match just push then ++