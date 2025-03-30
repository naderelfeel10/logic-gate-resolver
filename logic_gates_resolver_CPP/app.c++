
#include<iostream>
using namespace std;
int AND(int a, int b);
int OR(int a, int b);
int NOT(int a);
int XOR(int a, int b);
int NAND(int a, int b);
int NOR(int a, int b);
int Mystrlen(char txt[]);
bool is_Valid(char txt[], int j);
int main()
{
    char text1[100];
    cin.getline(text1, 100, '\n');

    char variables[10];
    int variable_counter = 0;
    bool flag_var = 1;
    char  text2[50];
    int counter_a_b = 0;
    int counter_nums = 0;
    int text2_counter = 0;
    int counter_e = 0;
    int AND_GATES = 0, OR_GATES = 0, NOT_GATES = 0, XOR_GATES = 0, NAND_GATES = 0, NOR_GATES = 0;



    // this loop will decode the original text as following
    /*
    AND   ==>  2
    OR    ==>  3
    NOT   ==>  4
    XOR   ==>  5
    NAND  ==>  6
    NOR   ==>  7
    */
    for (int i = 0; ; i++) {

        // spaces
        if (text1[i] == ' ') continue; //  && (text1[i + 1]) != ' '

        // end of the decoded string
        else if (text1[i] == '\0')
        {
            text2[text2_counter] = '\0';
            break;
        }

        // nums 
        else if ((text1[i] == '0' || text1[i] == '1')) {  // && (text1[i -1]) == ' '
            text2[text2_counter] = text1[i];
            text2_counter++;
            counter_nums++;
        }

        // e  
        else if ((text1[i]) == 'e' || (text1[i + 1]) == '\0') {   // && ((text1[i + 1]) == ' '
            counter_e++;
            text2[text2_counter] = '_';
            text2_counter++;
        }

        // gates 
        else if (toupper(text1[i]) == 'A'
            && (toupper(text1[i + 1])) == 'N'  // && ( (text1[i + 3]) == ' '
            && (toupper(text1[i + 2])) == 'D' && ((text1[i + 3]) == ' ' || (text1[i + 3]) == '1' || text1[i + 3] == '0'))
        {
            text2[text2_counter] = '2';
            text2_counter++;
            i += 2;
            AND_GATES++;
        }
        else if (toupper(text1[i]) == 'O'
            && (toupper(text1[i + 1])) == 'R' && ((text1[i + 2]) == ' ' || (text1[i + 2]) == '1' || text1[i + 2] == '0'))
        {
            text2[text2_counter] = '3';
            text2_counter++;
            i += 1;
            OR_GATES++;
        }

        else if (toupper(text1[i]) == 'N'
            && (toupper(text1[i + 1])) == 'O'
            && (toupper(text1[i + 2])) == 'T' && ((text1[i + 3]) == ' ' || (text1[i + 3]) == '1' || text1[i + 3] == '0')) {
            text2[text2_counter] = '4';
            text2_counter++;
            i += 2;
            NOT_GATES++;
        }
        else if (toupper(text1[i]) == 'X'
            && (toupper(text1[i + 1])) == 'O'
            && (toupper(text1[i + 2])) == 'R' && ((text1[i + 3]) == ' ' || (text1[i + 3]) == '1' || text1[i + 3] == '0'))
        {
            text2[text2_counter] = '5';
            text2_counter++;
            i += 2;
            XOR_GATES++;

        }
        else if (toupper(text1[i]) == 'N'
            && (toupper(text1[i + 1])) == 'A'
            && (toupper(text1[i + 2])) == 'N'
            && (toupper(text1[i + 3])) == 'D' && ((text1[i + 4]) == ' ' || (text1[i + 4]) == '1' || text1[i + 4] == '0'))
        {
            text2[text2_counter] = '6';
            text2_counter++;
            i += 3;
            NAND_GATES++;
        }

        else if (toupper(text1[i]) == 'N'
            && (toupper(text1[i + 1])) == 'O'
            && (toupper(text1[i + 2])) == 'R' && ((text1[i + 3]) == ' ' || (text1[i + 3]) == '1' || text1[i + 3] == '0')) {

            text2[text2_counter] = '7';
            text2_counter++;
            i += 2;
            NOR_GATES++;


        }


        // variables 
        else if (isalpha(text1[i]) && (text1[i - 1] == ' ' && text1[i + 1] == ' '))

        {
            flag_var = 1;

            variables[variable_counter] = (text1[i]);
            variable_counter++;

            for (int r = 0; r < variable_counter - 1; r++) {
                if ((text1[i]) == (variables[r])) {
                    flag_var = 0;
                }
            }
            text2[text2_counter] = (text1[i]);
            text2_counter++;
            if (flag_var) {
                counter_a_b++;
            }
        }

        //errors
        else {

            cout << "Wrong Logic Circuit Description";
            return 0;
        }
    }

    // errors
    if (AND_GATES + OR_GATES + NAND_GATES + NOR_GATES + XOR_GATES + NOT_GATES != counter_e) {
        cout << "Wrong Logic Circuit Description( e is not equal to the number of gates )";

        return 0;
    }
    if (counter_e == 0) {
        cout << "result : BAD input : missing input number";
        return 0;
    }

    string s1;
    // inputs operations
    if (counter_a_b > 0) {
        cout << counter_a_b << " varaibles are missing please enter them in separate lines" << endl;
    }

    for (int i = 0; i < counter_a_b; i++) {
        cin >> s1;

        for (int t = 0; text2[t] != '\0'; t++) {
            if (text2[t] == (s1[0])) {
                text2[t] = s1[2];
            }
        }
    }

    // getting the result
    for (int i = 0; i < counter_e; i++) {

        for (int j = Mystrlen(text2) - 1; j >= 0; j--)
        {

            if (text2[j] == '2')
            {
                if (is_Valid(text2, j) == 0) {
                    cout << "result : BAD input : missing input number" << endl;
                    return 0;
                }
                text2[j] = AND(int((text2[j + 1]) - '0'), int((text2[j + 2])) - '0') + '0';

                for (int w = 0; w < 3; w++) {
                    for (int q = j + 1; q < Mystrlen(text2); q++) {
                        text2[q] = text2[q + 1];
                    }
                }
            }
            else if (text2[j] == '3')
            {

                if (is_Valid(text2, j) == 0) {
                    cout << "result : BAD input : missing input number" << endl;
                    return 0;
                }
                text2[j] = OR(int((text2[j + 1]) - '0'), int((text2[j + 2])) - '0') + '0';

                for (int w = 0; w < 3; w++) {
                    for (int q = j + 1; q < Mystrlen(text2); q++) {
                        text2[q] = text2[q + 1];
                    }
                }
            }
            else if (text2[j] == '4')
            {

                if (text2[j + 1] != '0' && text2[j + 1] != '1') {
                    cout << "result : BAD input : missing input number" << endl;
                    return 0;
                }
                text2[j] = NOT((text2[j + 1]) - '0') + '0';

                for (int w = 0; w < 2; w++) {
                    for (int q = j + 1; q < Mystrlen(text2); q++) {
                        text2[q] = text2[q + 1];
                    }
                }
            }

            else if (text2[j] == '5')
            {

                if (is_Valid(text2, j) == 0) {
                    cout << "result : BAD input : missing input number" << endl;
                    return 0;
                }
                text2[j] = XOR((text2[j + 1]) - '0', int(text2[j + 2]) - '0') + '0';

                for (int w = 0; w < 3; w++) {
                    for (int q = j + 1; q < Mystrlen(text2); q++) {
                        text2[q] = text2[q + 1];
                    }
                }
            }

            else if (text2[j] == '6')
            {

                if (is_Valid(text2, j) == 0) {
                    cout << "result : BAD input : missing input number" << endl;
                    return 0;
                }
                text2[j] = NAND((text2[j + 1]) - '0', int(text2[j + 2]) - '0') + '0';

                for (int w = 0; w < 3; w++) {
                    for (int q = j + 1; q < Mystrlen(text2); q++) {
                        text2[q] = text2[q + 1];
                    }
                }
            }

            else if (text2[j] == '7')
            {

                if (is_Valid(text2, j) == 0) {
                    cout << "result : BAD input : missing input number" << endl;
                    return 0;
                }

                text2[j] = NOR((text2[j + 1]) - '0', int(text2[j + 2]) - '0') + '0';

                for (int w = 0; w < 3; w++) {
                    for (int q = j + 1; q < Mystrlen(text2); q++) {
                        text2[q] = text2[q + 1];
                    }
                }




            }

        }
    }

    // printing the output of the valid inputs
    cout << "AND gates : " << AND_GATES << endl;
    cout << "OR gates : " << OR_GATES << endl;
    cout << "NOT gates : " << NOT_GATES << endl;
    cout << "XOR gates : " << XOR_GATES << endl;
    cout << "NAND gates : " << NAND_GATES << endl;
    cout << "NOR gates : " << NOR_GATES << endl;
    cout << "result : " << text2 << endl;

}

// used functions
int  AND(int a, int b)
{
    return a & b;
}

int  OR(int a, int b)
{

    return (a | b);
}
int  NOT(int a)
{
    return a == 1 ? 0 : 1;
}
int XOR(int a, int b)
{
    return a ^ b;
}
int  NAND(int a, int b)
{
    return !(a & b);
}
int NOR(int a, int b)
{
    return !(a | b);
}
int Mystrlen(char txt[]) {
    int counter = 0;
    for (; txt[counter] != '\0'; counter++);
    return counter;
}
bool is_Valid(char txt[], int j) {

    if ((txt[j + 1] != '0' && txt[j + 1] != '1') || (txt[j + 2] != '0' && txt[j + 2] != '1')) {

        return 0;
    }
    return 1;
}

