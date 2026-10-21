class Solution {
public:
    vector<vector<int>> transpose(vector<vector<int>>& matrix) {
        int row= matrix.size();
        int col=matrix[0].size();
        vector<vector<int>> ans(col,vector<int>(row));// when transponse n*m=m*n
        for (int i=0;i<row;i++){
            for (int j=0;j<col;j++){
                ans[j][i]= matrix[i][j];// current position switch in ans


            }
        }
        return ans; 
    }
};
// vector<vector<int>> ans(3, vector<int>(2)); = [
 // [0, 0],
//  [0, 0],
 // [0, 0]
//]

// 1. Get the number of rows N (size)and columns M from matrix(0 index).
// 2. Create a new matrix with M rows and N columns.
// 3. Use a for loop to go through each row i in the original matrix.
// 4. Inside it, use another for loop to go through each column j.
// 5. Put the original matrix[i][j] into the new matrix[j][i].
//    This is where the row and column indices switch.
// 6. Return the new matrix.