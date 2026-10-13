const {test, expect} = require('@playwright/test');

// test('login with Valid credentials', async ({browser}) =>
// {

//     const page =browser.newContext();
// });

test('Browser context test case', async({browser}) =>
{

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://rahulshettyacademy.com/loginpagePractise");
    console.log(await page.title());
    expect(await page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy"); 

});

test('page context test case', async({page})=>
{
    const page1 = await page.goto("https://google");
    console.log(await page1.title());
    
    expect(await page1).toHaveTitle("Google");

});