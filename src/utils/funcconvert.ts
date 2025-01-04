export function pythonFunction(code: string, testcases: number): string {
    const template = `def solve():
    # Original function code here
    return

if __name__ == "__main__":
    for _ in range(${testcases}):
        result = solve()
        print(result)`;

    return template.replace('# Original function code here', code);
}

export function cFunction(code: string, testcases: number): string {
    const template = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdbool.h>
#include <limits.h>
#include <ctype.h>

int solve() {
    // Original function code here
    return 0;
}

int main() {
    int t = ${testcases};
    while(t--) {
        int result = solve();
        printf("%d\\n", result);
    }
    return 0;
}`;

    return template.replace('// Original function code here', code);
}

export function cppFunction(code: string, testcases: number): string {
    const template = `#include <bits/stdc++.h>
using namespace std;

int solve() {
    // Original function code here
    return 0;
}

int main() {
    int t = ${testcases};
    while(t--) {
        int result = solve();
        cout << result << endl;
    }
    return 0;
}`;

    return template.replace('// Original function code here', code);
}

export function javaFunction(code: string, testcases: number): string {
    const template = `import java.util.*;

public class Solution {
    public static int solve() {
        // Original function code here
        return 0;
    }
    
    public static void main(String[] args) {
        int t = ${testcases};
        while(t-- > 0) {
            int result = solve();
            System.out.println(result);
        }
    }
}`;

    return template.replace('// Original function code here', code);
}

export function jsFunction(code: string, testcases: number): string {
    const template = `function solve() {
    // Original function code here
    return 0;
}

for(let i = 0; i < ${testcases}; i++) {
    const result = solve();
    console.log(result);
}`;

    return template.replace('// Original function code here', code);
}

export function goFunction(code: string, testcases: number): string {
    const template = `package main

 
import (
	"bufio"
	"cmp"
	"fmt"
	"math"
	"os"
	"slices"
	"strconv"
	"time"
)

func solve() int {
    // Original function code here
    return 0
}

func main() {
    for i := 0; i < ${testcases}; i++ {
        result := solve()
        fmt.Println(result)
    }
}`;

    return template.replace('// Original function code here', code);
}