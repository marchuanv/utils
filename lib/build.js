function Build(package, process, shelljs, nodepowershell){
  const isWindows = (process.platform === "win32");
  const shell=shelljs;
  const Powershell=nodepowershell;
  this.installFromGithub=function(githubLibraryReference) {
    if (isWindows==true) {
      let shell = new Powershell({
        executionPolicy: 'Bypass',
        noProfile: true
      });
      console.log(`installing ${githubLibraryReference}`);
      shell.addCommand(`npm install ${githubLibraryReference}`);
      console.log(`updating ${githubLibraryReference}`);
      shell.addCommand(`npm update ${githubLibraryReference}`);
      shell.invoke().then(output => {
        console.log(output);
        shell.dispose();
      }).catch(err => {
        console.log(err);
        shell.dispose();
      });
    }else{
      console.log(`installing ${githubLibraryReference}`);
      shell.exec(`npm install ${githubLibraryReference}`);
      console.log(`updating ${githubLibraryReference}`);
      shell.exec(`npm update ${githubLibraryReference}`);
    }
  }
};
